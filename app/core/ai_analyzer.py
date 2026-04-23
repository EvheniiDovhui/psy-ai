# app/core/ai_analyzer.py
import json
import os
import time
from dotenv import load_dotenv

try:
    from google import genai
except Exception:
    genai = None

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.dirname(os.path.dirname(_THIS_DIR))
load_dotenv(os.path.join(_PROJECT_ROOT, ".env"))

MODEL_ID = os.getenv("GEMINI_MODEL_ID", "models/gemini-2.5-flash")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
FALLBACK_MODELS = [MODEL_ID, "models/gemini-2.5-flash"]
AI_VERBOSE_LOGS = os.getenv("AI_VERBOSE_LOGS", "0") == "1"


def _short_error_message(error: Exception, max_len: int = 220) -> str:
    text = str(error).replace("\n", " ").strip()
    if len(text) > max_len:
        return text[:max_len] + "..."
    return text

# Безпечна ініціалізація клієнта: якщо ключа немає або SDK недоступний,
# повертаємо fallback-аналітику замість падіння API.
client = None
if genai and GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"🔥 GEMINI CLIENT INIT ERROR: {e}")


def clamp(value: int, low: int, high: int) -> int:
    return max(low, min(high, value))


def _keyword_hits(text: str, keywords):
    lowered = text.lower()
    return sum(1 for key in keywords if key in lowered)


def _build_local_conclusion(neuroticism: int, extraversion: int, openness: int, agreeableness: int, conscientiousness: int):
    stress_part = "помірний емоційний фон"
    if neuroticism >= 4:
        stress_part = "підвищена емоційна напруга та чутливість до стресу"
    elif neuroticism <= 2:
        stress_part = "відносно стабільний емоційний фон"

    social_part = "баланс між потребою в автономії та контакті"
    if extraversion >= 4:
        social_part = "виражена орієнтація на соціальну взаємодію"
    elif extraversion <= 2:
        social_part = "схильність до стриманості та внутрішнього опрацювання"

    growth_part = "помірний потенціал до змін"
    if openness >= 4 and conscientiousness >= 4:
        growth_part = "високий потенціал до розвитку та системних змін"
    elif openness <= 2:
        growth_part = "орієнтація на перевірені стратегії та передбачуваність"

    relation_part = "нейтральний стиль взаємодії"
    if agreeableness >= 4:
        relation_part = "доброжичливий кооперативний стиль взаємодії"
    elif agreeableness <= 2:
        relation_part = "більш критичний і дистанційний стиль взаємодії"

    return (
        "Локальний AI-профіль: "
        f"{stress_part}; {social_part}; {growth_part}; {relation_part}. "
        "Рекомендовано підтвердити висновки на клінічній сесії для персоналізованого плану терапії."
    )


def _fallback_sachs_profile(text: str):
    hits_distress = _keyword_hits(text, ["тривог", "страх", "втом", "безсил", "смут", "депрес", "самот"])
    hits_social = _keyword_hits(text, ["друг", "родин", "підтрим", "спілку", "довір"])
    hits_growth = _keyword_hits(text, ["ціль", "план", "розвит", "хочу", "можу", "навч"])

    neuroticism = clamp(3 + (1 if hits_distress >= 2 else 0), 1, 5)
    extraversion = clamp(3 + (1 if hits_social >= 2 else 0) - (1 if hits_distress >= 3 else 0), 1, 5)
    openness = clamp(3 + (1 if hits_growth >= 2 else 0), 1, 5)
    conscientiousness = clamp(3 + (1 if hits_growth >= 3 else 0), 1, 5)
    agreeableness = clamp(3 + (1 if hits_social >= 3 else 0), 1, 5)

    conclusion = _build_local_conclusion(
        neuroticism,
        extraversion,
        openness,
        agreeableness,
        conscientiousness,
    )

    return {
        "big_five": {
            "neuroticism": neuroticism,
            "extraversion": extraversion,
            "openness": openness,
            "agreeableness": agreeableness,
            "conscientiousness": conscientiousness,
        },
        "maslow": {
            "physiological": 3,
            "safety": clamp(3 - (1 if hits_distress >= 3 else 0), 1, 5),
            "love": clamp(3 + (1 if hits_social >= 2 else 0), 1, 5),
            "esteem": clamp(3 + (1 if hits_growth >= 2 else 0), 1, 5),
            "self_actualization": clamp(3 + (1 if hits_growth >= 3 else 0), 1, 5),
        },
        "schwartz": {
            "power": 3,
            "achievement": clamp(3 + (1 if hits_growth >= 2 else 0), 1, 5),
            "hedonism": 3,
            "security": clamp(3 - (1 if hits_distress >= 2 else 0), 1, 5),
            "benevolence": clamp(3 + (1 if hits_social >= 2 else 0), 1, 5),
            "universalism": 3,
            "self_direction": clamp(3 + (1 if hits_growth >= 2 else 0), 1, 5),
            "stimulation": 3,
            "conformity": 3,
            "tradition": 3,
        },
        "conclusion": conclusion,
        "analysis_source": "local-fallback",
    }


def _fallback_interview_profile(text: str):
    hits_anxiety = _keyword_hits(text, ["тривог", "панік", "страх", "напруж", "невпевн"])
    hits_low_resource = _keyword_hits(text, ["втом", "безсил", "не можу", "нема сил", "вигоран"])
    hits_social = _keyword_hits(text, ["родин", "друз", "самот", "конфлікт", "підтрим"])

    emotional = clamp(7 - hits_anxiety, 1, 10)
    resources = clamp(7 - hits_low_resource, 1, 10)
    social = clamp(6 - (1 if "самот" in text.lower() else 0) + (1 if hits_social >= 2 else 0), 1, 10)
    reflection = clamp(5 + (1 if len(text) > 120 else 0), 1, 10)

    markers = []
    if hits_anxiety >= 2:
        markers.append("Підвищена тривожність")
    if hits_low_resource >= 2:
        markers.append("Ознаки емоційного виснаження")
    if "сон" in text.lower():
        markers.append("Можливі порушення сну")
    if not markers:
        markers = ["Помірний емоційний дискомфорт"]

    return {
        "scores": {
            "emotional_stability": emotional,
            "social_adaptation": social,
            "resource_level": resources,
            "self_reflection": reflection,
        },
        "core_request": "Стабілізація емоційного стану та зниження дистресу",
        "markers": markers,
        "clinical_summary": "Сформовано попередній структурований запит без зовнішнього AI. Потрібне клінічне підтвердження фахівцем.",
    }


def _severity_from_beck_score(total_score: int) -> str:
    if total_score >= 30:
        return "Важка депресія"
    if total_score >= 20:
        return "Виражена депресія"
    if total_score >= 16:
        return "Помірна депресія"
    if total_score >= 10:
        return "Легка депресія"
    return "Мінімальні прояви депресії"


def _fallback_beck_analysis(total_score: int):
    severity = _severity_from_beck_score(total_score)
    risk_markers = ["Емоційне виснаження", "Потреба в підтримці"]
    if total_score >= 20:
        risk_markers.append("Клінічно значимий рівень симптомів")
    if total_score >= 30:
        risk_markers.append("Високий ризик декомпенсації")

    return {
        "severity_label": severity,
        "clinical_summary": "Попередня інтерпретація сформована без зовнішнього AI. Рекомендується очна/онлайн консультація фахівця для верифікації клінічного стану.",
        "risk_markers": risk_markers,
        "action_plan": [
            "Нормалізувати сон та режим дня протягом 7 днів",
            "Щодня виконувати 1-2 короткі активності, що дають відчуття контролю",
            "Запланувати консультацію з психологом або психіатром при погіршенні стану",
        ],
    }

def clean_ai_json(raw_text):
    """Очищення відповіді AI від маркдауну та випадкового тексту"""
    try:
        text = raw_text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        # 1) Стандартний випадок: відповідь одразу валідний JSON.
        try:
            return json.loads(text)
        except Exception:
            pass

        # 2) Пошук першого JSON-об'єкта всередині змішаного тексту.
        start = text.find("{")
        if start != -1:
            depth = 0
            in_string = False
            escaped = False
            for idx in range(start, len(text)):
                ch = text[idx]
                if in_string:
                    if escaped:
                        escaped = False
                    elif ch == "\\":
                        escaped = True
                    elif ch == '"':
                        in_string = False
                    continue

                if ch == '"':
                    in_string = True
                elif ch == "{":
                    depth += 1
                elif ch == "}":
                    depth -= 1
                    if depth == 0:
                        candidate = text[start : idx + 1]
                        return json.loads(candidate)

        raise ValueError("JSON object not found in model response")
    except Exception as e:
        print(f"❌ Помилка парсингу JSON: {e}\nОтримано текст: {raw_text[:100]}...")
        return None


def _generate_content_with_model_fallback(prompt: str):
    if not client:
        return None

    tried = set()
    last_error = None

    for model in FALLBACK_MODELS:
        if not model or model in tried:
            continue
        tried.add(model)
        for attempt in range(3):
            try:
                return client.models.generate_content(model=model, contents=prompt)
            except Exception as e:
                last_error = e
                message = str(e).upper()
                is_transient = (
                    "UNAVAILABLE" in message
                    or "503" in message
                    or "INTERNAL" in message
                    or "DEADLINE_EXCEEDED" in message
                )

                if AI_VERBOSE_LOGS:
                    print(
                        f"⚠️ GEMINI model issue ({model}, attempt {attempt + 1}/3): "
                        f"{_short_error_message(e)}"
                    )

                if not is_transient or attempt == 2:
                    break

                # Короткий backoff для тимчасових збоїв сервісу.
                time.sleep(0.6 * (attempt + 1))

    if last_error:
        raise last_error

    return None

def analyze_text_with_gemini(text: str):
    """Для тесту Сакса-Леві"""
    prompt = f"""
    Ти — професійний психолог. Проаналізуй результати тесту незакінчених речень (Сакса-Леві).
    
    ОЦІНКА:
    Проаналізуй кожне речення в контексті. Оціни за шкалою 1-5 (де 5 - найвищий прояв) наступні параметри:
    1. Big Five (neuroticism, openness, conscientiousness, extraversion, agreeableness)
    2. Maslow (physiological, safety, love, esteem, self_actualization)
    3. Schwartz (power, achievement, hedonism, security, benevolence, universalism, self_direction, stimulation, conformity, tradition)

    ТЕКСТ ТЕСТУ:
    "{text}"

    ПОВЕРНИ ТІЛЬКИ чистий JSON з точними ключами:
    {{
        "big_five": {{"neuroticism": 1-5, "extraversion": 1-5, "openness": 1-5, "agreeableness": 1-5, "conscientiousness": 1-5}},
        "maslow": {{"physiological": 1-5, "safety": 1-5, "love": 1-5, "esteem": 1-5, "self_actualization": 1-5}},
        "schwartz": {{"power": 1-5, "achievement": 1-5, "hedonism": 1-5, "security": 1-5, "benevolence": 1-5, "universalism": 1-5, "self_direction": 1-5, "stimulation": 1-5, "conformity": 1-5, "tradition": 1-5}},
        "conclusion": "короткий психологічний портрет на основі цілісних речень"
    }}
    """
    if not client:
        return _fallback_sachs_profile(text)

    try:
        response = _generate_content_with_model_fallback(prompt)
        if not response:
            return _fallback_sachs_profile(text)
        parsed = clean_ai_json(response.text)
        return parsed or _fallback_sachs_profile(text)
    except Exception as e:
        if AI_VERBOSE_LOGS:
            print(f"SACHS AI fallback: {_short_error_message(e)}")
        return _fallback_sachs_profile(text)


def analyze_full_profile_with_gemini(combined_context: str):
    """Розширений AI-аналіз цілісного психологічного профілю клієнта."""
    prompt = f"""
    Ти — клінічний психолог-супервізор. У тебе є агрегований контекст по клієнту з кількох методик.
    Зроби цілісний професійний профіль особистості.

    КОНТЕКСТ КЛІЄНТА:
    "{combined_context}"

    ВИМОГИ:
    1. Оціни узагальнений профіль за шкалами 1-5:
       - Big Five: neuroticism, extraversion, openness, agreeableness, conscientiousness
       - Maslow: physiological, safety, love, esteem, self_actualization
       - Schwartz: power, achievement, hedonism, security, benevolence, universalism,
         self_direction, stimulation, conformity, tradition
    2. Напиши глибоке узагальнене резюме (conclusion), де є:
       - ключові сильні сторони
       - ключові зони вразливості
       - міжособистісний стиль
    3. Дай клінічні інсайти для психолога:
       - therapeutic_focus: 3-5 пріоритетів роботи
       - recommendations: 5 практичних рекомендацій

    ПОВЕРНИ ТІЛЬКИ JSON (без markdown):
    {{
      "big_five": {{"neuroticism": 1-5, "extraversion": 1-5, "openness": 1-5, "agreeableness": 1-5, "conscientiousness": 1-5}},
      "maslow": {{"physiological": 1-5, "safety": 1-5, "love": 1-5, "esteem": 1-5, "self_actualization": 1-5}},
      "schwartz": {{"power": 1-5, "achievement": 1-5, "hedonism": 1-5, "security": 1-5, "benevolence": 1-5, "universalism": 1-5, "self_direction": 1-5, "stimulation": 1-5, "conformity": 1-5, "tradition": 1-5}},
      "conclusion": "...",
      "therapeutic_focus": ["..."],
      "recommendations": ["..."]
    }}
    """

    if not client:
        fallback = _fallback_sachs_profile(combined_context)
        fallback["therapeutic_focus"] = [
            "Зниження емоційного дистресу",
            "Стабілізація щоденного режиму і ресурсності",
            "Посилення соціальної підтримки",
        ]
        fallback["recommendations"] = [
            "Вести короткий щоденник стану 1 раз на день",
            "Використовувати техніки дихання при піках тривоги",
            "Планувати щоденні малі досяжні цілі",
            "Фіксувати тригери та автоматичні думки",
            "Проводити щотижневий перегляд динаміки з психологом",
        ]
        return fallback

    try:
        response = _generate_content_with_model_fallback(prompt)
        if not response:
            return _fallback_sachs_profile(combined_context)
        parsed = clean_ai_json(response.text)
        if parsed:
            return parsed
    except Exception as e:
        if AI_VERBOSE_LOGS:
            print(f"FULL PROFILE AI fallback: {_short_error_message(e)}")

    fallback = _fallback_sachs_profile(combined_context)
    fallback["therapeutic_focus"] = [
        "Зниження емоційного дистресу",
        "Розвиток саморегуляції",
        "Поступове посилення адаптаційних стратегій",
    ]
    fallback["recommendations"] = [
        "Моніторити сон і рівень втоми щодня",
        "Додавати короткі відновлювальні паузи вдень",
        "Опрацьовувати мисленнєві викривлення у щоденнику",
        "Фіксувати позитивні дії та досягнення",
        "Обговорювати прогрес і бар'єри на сесіях",
    ]
    return fallback

def analyze_interview_with_gemini(text: str):
    """Для Первинного інтерв'ю"""
    prompt = f"""
    Ти — досвідчений психотерапевт. Проаналізуй розповідь клієнта: "{text}"
    
    Відповідь ТІЛЬКИ у форматі JSON з точними ключами:
    {{
        "scores": {{
            "emotional_stability": 1-10,
            "social_adaptation": 1-10,
            "resource_level": 1-10,
            "self_reflection": 1-10
        }},
        "core_request": "Головна проблема одним реченням",
        "markers": ["маркер 1", "маркер 2", "маркер 3"],
        "clinical_summary": "Глибокий психологічний аналіз стану клієнта..."
    }}
    """
    if not client:
        return _fallback_interview_profile(text)

    try:
        response = _generate_content_with_model_fallback(prompt)
        if not response:
            return _fallback_interview_profile(text)
        parsed = clean_ai_json(response.text)
        return parsed or _fallback_interview_profile(text)
    except Exception as e:
        if AI_VERBOSE_LOGS:
            print(f"INTERVIEW AI fallback: {_short_error_message(e)}")
        return _fallback_interview_profile(text)

def analyze_beck_with_gemini(total_score: int, answers_text: str):
    """ШІ-аналіз Шкали депресії Бека"""
    prompt = f"""
    Ти — клінічний психіатр. Проаналізуй результати тесту Бека на депресію.
    Загальний бал пацієнта: {total_score} (з 63 можливих).
    
    Відповіді пацієнта на ключові питання:
    {answers_text}
    
    Твоє завдання:
    1. Оцінити ризики (особливо звернути увагу на суїцидальні думки, якщо вони є).
    2. Сформувати терапевтичний висновок.
    3. Дати 3 конкретні кроки самодопомоги або рекомендацію звернутися до лікаря.

    Відповідь ТІЛЬКИ у форматі JSON:
    {{
        "severity_label": "Легка / Помірна / Важка депресія (на основі балу)",
        "clinical_summary": "Глибокий емпатичний аналіз стану (4-5 речень)...",
        "risk_markers": ["маркер 1", "маркер 2"],
        "action_plan": ["Крок 1", "Крок 2", "Крок 3"]
    }}
    """
    if not client:
        return _fallback_beck_analysis(total_score)

    try:
        response = _generate_content_with_model_fallback(prompt)
        if not response:
            return _fallback_beck_analysis(total_score)
        parsed = clean_ai_json(response.text)
        return parsed or _fallback_beck_analysis(total_score)
    except Exception as e:
        if AI_VERBOSE_LOGS:
            print(f"BECK AI fallback: {_short_error_message(e)}")
        return _fallback_beck_analysis(total_score)