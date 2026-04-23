import json
import os
import time

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.ai_analyzer import (
    analyze_beck_with_gemini,
    analyze_full_profile_with_gemini,
    analyze_interview_with_gemini,
    analyze_text_with_gemini,
)
from app.core.database import TestResult
from app.core.metrics import free_energy, tononi_complexity
from app.services.chat_service import _to_display_time
from app.schemas.tests import BeckPayload, InterviewPayload, SachsTestPayload, TestResultCreate


FULL_PROFILE_CACHE_TTL_SEC = max(30, int(os.getenv("FULL_PROFILE_CACHE_TTL_SEC", "1800")))
FULL_PROFILE_FORCE_COOLDOWN_SEC = max(5, int(os.getenv("FULL_PROFILE_FORCE_COOLDOWN_SEC", "90")))
_FULL_PROFILE_CACHE = {}

PROBLEM_SOLVING_ITEMS = [2, 3, 8, 9, 11, 15, 16, 17, 20, 29, 33]
SOCIAL_SUPPORT_ITEMS = [1, 5, 7, 12, 14, 19, 23, 24, 25, 31, 32]
AVOIDANCE_ITEMS = [4, 6, 10, 13, 18, 21, 22, 26, 27, 28, 30]


LEGACY_FALLBACK_MARKERS = [
    "Попередній автоматичний аналіз",
    "Сформовано попередній структурований запит без зовнішнього AI",
    "Попередня інтерпретація сформована без зовнішнього AI",
]


def _looks_legacy_fallback(text: str) -> bool:
    return any(marker in text for marker in LEGACY_FALLBACK_MARKERS)


def _dynamic_sachs_conclusion(profile: dict) -> str:
    b5 = profile.get("big_five", {}) if isinstance(profile, dict) else {}
    neuroticism = int(b5.get("neuroticism", 3) or 3)
    extraversion = int(b5.get("extraversion", 3) or 3)
    openness = int(b5.get("openness", 3) or 3)
    agreeableness = int(b5.get("agreeableness", 3) or 3)
    conscientiousness = int(b5.get("conscientiousness", 3) or 3)

    stress = "помірний емоційний фон"
    if neuroticism >= 4:
        stress = "підвищена емоційна напруга"
    elif neuroticism <= 2:
        stress = "стабільний емоційний фон"

    social = "збалансований соціальний стиль"
    if extraversion >= 4:
        social = "виражена орієнтація на взаємодію"
    elif extraversion <= 2:
        social = "схильність до стриманості"

    growth = "помірний потенціал до змін"
    if openness >= 4 and conscientiousness >= 4:
        growth = "високий потенціал до структурованих змін"
    elif openness <= 2:
        growth = "фокус на перевірених стратегіях"

    relation = "нейтральний стиль взаємодії"
    if agreeableness >= 4:
        relation = "кооперативний доброзичливий стиль"
    elif agreeableness <= 2:
        relation = "більш критичний стиль взаємодії"

    return (
        f"Локальний профіль: {stress}; {social}; {growth}; {relation}. "
        "Рекомендовано підтвердити висновки на консультації фахівця."
    )


def _dynamic_interview_summary(profile: dict) -> str:
    emotional = int(profile.get("Емоційний стан", 5) or 5)
    resources = int(profile.get("Рівень ресурсів", 5) or 5)
    social = int(profile.get("Соціальна адаптація", 5) or 5)
    reflection = int(profile.get("Рефлексія", 5) or 5)

    return (
        "Первинний профіль: "
        f"емоційна стабільність {emotional}/10, "
        f"ресурсність {resources}/10, "
        f"соціальна адаптація {social}/10, "
        f"рефлексія {reflection}/10. "
        "Рекомендовано уточнення клінічних гіпотез на наступній сесії."
    )


def _dynamic_beck_summary(profile: dict) -> str:
    score = int(profile.get("Загальний бал", 0) or 0)
    level = str(profile.get("Клінічний рівень", "Невизначений рівень"))

    if score >= 30:
        accent = "виражений рівень депресивної симптоматики"
    elif score >= 20:
        accent = "клінічно значимі депресивні прояви"
    elif score >= 16:
        accent = "помірні депресивні прояви"
    elif score >= 10:
        accent = "легкі депресивні прояви"
    else:
        accent = "мінімальні депресивні прояви"

    return (
        f"Оцінка Бека: {score}/63 ({level}); {accent}. "
        "Рекомендовано моніторинг стану та консультацію фахівця при посиленні симптомів."
    )


def _sanitize_legacy_ai_response(ai_response: str) -> str:
    if not ai_response:
        return ai_response

    try:
        payload = json.loads(ai_response)
    except Exception:
        return ai_response

    if not isinstance(payload, dict):
        return ai_response

    profile = payload.get("profile")
    if not isinstance(profile, dict):
        return ai_response

    changed = False

    conclusion = profile.get("conclusion")
    if isinstance(conclusion, str) and _looks_legacy_fallback(conclusion):
        profile["conclusion"] = _dynamic_sachs_conclusion(profile)
        changed = True

    interview_summary = profile.get("Клінічне резюме")
    if isinstance(interview_summary, str) and _looks_legacy_fallback(interview_summary):
        profile["Клінічне резюме"] = _dynamic_interview_summary(profile)
        changed = True

    beck_summary = profile.get("Аналітичне резюме AI")
    if isinstance(beck_summary, str) and _looks_legacy_fallback(beck_summary):
        profile["Аналітичне резюме AI"] = _dynamic_beck_summary(profile)
        changed = True

    if not changed:
        return ai_response

    payload["profile"] = profile
    return json.dumps(payload, ensure_ascii=False)


def _profile_ai_source(profile: dict) -> str:
    if isinstance(profile, dict) and profile.get("analysis_source") == "local-fallback":
        return "local-fallback"
    return "external-ai"


def _build_ai_meta(source: str, cached: bool, cache_age_sec: int, cooldown_remaining_sec: int = 0) -> dict:
    return {
        "source": source,
        "cached": cached,
        "cache_age_sec": max(0, cache_age_sec),
        "cache_ttl_sec": FULL_PROFILE_CACHE_TTL_SEC,
        "cooldown_remaining_sec": max(0, cooldown_remaining_sec),
    }


async def analyze_interview(data: InterviewPayload):
    if len(data.text) < 10:
        raise HTTPException(status_code=400, detail="Текст занадто короткий")

    result = analyze_interview_with_gemini(data.text)
    if not result:
        raise HTTPException(status_code=500, detail="Помилка генерації AI")

    return {"status": "success", "data": result}


async def analyze_sachs_test(data: SachsTestPayload):
    combined_text = " ".join(
        [
            f"{item.prompt} {item.answer}."
            for _, items in data.results.items()
            for item in items
            if item.answer.strip()
        ]
    )
    if not combined_text.strip():
        raise HTTPException(status_code=400, detail="Тест порожній")

    profile_data = analyze_text_with_gemini(combined_text)
    if not profile_data:
        raise HTTPException(status_code=500, detail="Помилка генерації AI")

    b5 = profile_data.get("big_five", {})
    return {
        "status": "success",
        "metrics": {
            "tononi_complexity": tononi_complexity(b5),
            "free_energy": free_energy(b5),
        },
        "profile": profile_data,
    }


async def analyze_beck(data: BeckPayload):
    result = analyze_beck_with_gemini(data.total_score, data.answers_summary)
    if not result:
        raise HTTPException(status_code=500, detail="AI Analysis failed")
    return {"status": "success", "data": result}


def _sum_by_items(answers: list[int], items: list[int]) -> int:
    return sum(answers[idx - 1] for idx in items)


def _level_from_ratio(ratio: float) -> str:
    if ratio >= 0.75:
        return "Високий"
    if ratio >= 0.45:
        return "Помірний"
    return "Низький"


def _coping_recommendations(problem_ratio: float, support_ratio: float, avoidance_ratio: float) -> list[str]:
    recs = []
    if problem_ratio < 0.45:
        recs.append("Щотижня фіксуйте 1-2 конкретні кроки вирішення кожної актуальної проблеми.")
    if support_ratio < 0.45:
        recs.append("Заплануйте регулярні контакти з людьми, до яких є довіра, та просіть про конкретну допомогу.")
    if avoidance_ratio >= 0.75:
        recs.append("Відстежуйте ситуації уникнення і замінюйте їх на короткі дії з контрольованим навантаженням.")
    if not recs:
        recs = [
            "Підтримуйте баланс між самостійним вирішенням проблем і зверненням по підтримку.",
            "Раз на тиждень переглядайте, які стратегії були ефективними, а які посилювали стрес.",
        ]
    return recs


async def analyze_coping(answers: list[int]):
    if len(answers) != 33:
        raise HTTPException(status_code=400, detail="Потрібно надати відповіді на всі 33 твердження")
    if any(answer not in (0, 1, 2) for answer in answers):
        raise HTTPException(status_code=400, detail="Некоректні значення відповідей")

    problem_score = _sum_by_items(answers, PROBLEM_SOLVING_ITEMS)
    support_score = _sum_by_items(answers, SOCIAL_SUPPORT_ITEMS)
    avoidance_score = _sum_by_items(answers, AVOIDANCE_ITEMS)

    max_score = len(PROBLEM_SOLVING_ITEMS) * 2
    problem_ratio = problem_score / max_score
    support_ratio = support_score / max_score
    avoidance_ratio = avoidance_score / max_score

    strategy_scores = {
        "problem_solving": problem_score,
        "social_support": support_score,
        "avoidance": avoidance_score,
    }
    dominant_map = {
        "problem_solving": "Стратегія вирішення проблем",
        "social_support": "Стратегія пошуку соціальної підтримки",
        "avoidance": "Стратегія уникнення",
    }
    max_score_value = max(strategy_scores.values())
    top_keys = [key for key, value in strategy_scores.items() if value == max_score_value]
    if len(top_keys) == 1:
        dominant_strategy = dominant_map[top_keys[0]]
    else:
        dominant_strategy = "Комбінований копінг-профіль"

    if len(top_keys) == 1:
        interpretation = (
            f"Домінує: {dominant_strategy}. "
            "Профіль показує типову модель подолання стресу в поточний період і має інтерпретуватися в контексті клінічної бесіди."
        )
    else:
        interpretation = (
            "Виражених домінант не виявлено: використовується комбінований стиль подолання стресу. "
            "Доцільно відстежувати, які стратегії є найбільш ефективними у конкретних ситуаціях."
        )

    return {
        "status": "success",
        "data": {
            "analysis_source": "rule-based",
            "scores": strategy_scores,
            "levels": {
                "problem_solving": _level_from_ratio(problem_ratio),
                "social_support": _level_from_ratio(support_ratio),
                "avoidance": _level_from_ratio(avoidance_ratio),
            },
            "dominant_strategy": dominant_strategy,
            "interpretation": interpretation,
            "recommendations": _coping_recommendations(problem_ratio, support_ratio, avoidance_ratio),
        },
    }


def save_test_result(req: TestResultCreate, db: Session):
    new_result = TestResult(
        user_id=req.user_id,
        test_type=req.test_type,
        ai_response=req.ai_response,
    )
    db.add(new_result)
    db.commit()
    return {"status": "success"}


def get_test_results(user_id: int, db: Session):
    results = (
        db.query(TestResult)
        .filter(TestResult.user_id == user_id)
        .order_by(TestResult.created_at.desc())
        .all()
    )

    data = []
    for r in results:
        local_dt = _to_display_time(r.created_at)
        sanitized_response = _sanitize_legacy_ai_response(r.ai_response)
        data.append(
            {
                "id": r.id,
                "test_type": r.test_type,
                "ai_response": sanitized_response,
                "date": local_dt.strftime("%d.%m.%Y %H:%M"),
            }
        )
    return {"status": "success", "data": data}


def build_full_profile(user_id: int, db: Session, force_refresh: bool = False):
    now = time.time()
    cached_entry = _FULL_PROFILE_CACHE.get(user_id)
    if cached_entry:
        age = int(now - cached_entry["ts"])
        base_data = dict(cached_entry["data"])
        source = cached_entry["source"]

        if not force_refresh and age < FULL_PROFILE_CACHE_TTL_SEC:
            base_data["ai"] = _build_ai_meta(source, cached=True, cache_age_sec=age)
            return {"status": "success", "data": base_data}

        if force_refresh and age < FULL_PROFILE_FORCE_COOLDOWN_SEC:
            remaining = FULL_PROFILE_FORCE_COOLDOWN_SEC - age
            base_data["ai"] = _build_ai_meta(
                source,
                cached=True,
                cache_age_sec=age,
                cooldown_remaining_sec=remaining,
            )
            return {"status": "success", "data": base_data}

    results = (
        db.query(TestResult)
        .filter(TestResult.user_id == user_id)
        .order_by(TestResult.created_at.asc())
        .all()
    )

    if not results:
        raise HTTPException(status_code=404, detail="Немає даних для формування профілю")

    context_chunks = []
    for result in results:
        context_chunks.append(f"Тест: {result.test_type}")
        sanitized_response = _sanitize_legacy_ai_response(result.ai_response)
        try:
            payload = json.loads(sanitized_response)
            if isinstance(payload, dict):
                profile_data = payload.get("profile")
                if profile_data:
                    context_chunks.append(f"Профіль: {json.dumps(profile_data, ensure_ascii=False)}")

                raw_answers = payload.get("raw_answers")
                if isinstance(raw_answers, list) and raw_answers:
                    limited_answers = raw_answers[:20]
                    context_chunks.append(
                        "Відповіді: "
                        + json.dumps(limited_answers, ensure_ascii=False)
                    )
            else:
                context_chunks.append(str(payload))
        except Exception:
            context_chunks.append(str(sanitized_response)[:2000])

    combined_context = "\n\n".join(context_chunks)[:25000]
    profile = analyze_full_profile_with_gemini(combined_context)
    b5 = profile.get("big_five", {}) if isinstance(profile, dict) else {}
    source = _profile_ai_source(profile)

    response_data = {
        "profile": profile,
        "metrics": {
            "tononi_complexity": tononi_complexity(b5),
            "free_energy": free_energy(b5),
        },
        "sources_count": len(results),
        "source_tests": [r.test_type for r in results],
    }

    _FULL_PROFILE_CACHE[user_id] = {
        "ts": now,
        "source": source,
        "data": response_data,
    }

    response_data = dict(response_data)
    response_data["ai"] = _build_ai_meta(source, cached=False, cache_age_sec=0)

    return {
        "status": "success",
        "data": response_data,
    }
