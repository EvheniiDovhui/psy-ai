# app/core/ai_analyzer.py
import json
import os
from dotenv import load_dotenv

try:
    from google import genai
except Exception:
    genai = None

load_dotenv()

MODEL_ID = os.getenv("GEMINI_MODEL_ID", "models/gemini-2.0-flash")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

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


def _fallback_sachs_profile(text: str):
    hits_distress = _keyword_hits(text, ["тривог", "страх", "втом", "безсил", "смут", "депрес", "самот"])
    hits_social = _keyword_hits(text, ["друг", "родин", "підтрим", "спілку", "довір"])
    hits_growth = _keyword_hits(text, ["ціль", "план", "розвит", "хочу", "можу", "навч"])

    neuroticism = clamp(3 + (1 if hits_distress >= 2 else 0), 1, 5)
    extraversion = clamp(3 + (1 if hits_social >= 2 else 0) - (1 if hits_distress >= 3 else 0), 1, 5)
    openness = clamp(3 + (1 if hits_growth >= 2 else 0), 1, 5)
    conscientiousness = clamp(3 + (1 if hits_growth >= 3 else 0), 1, 5)
    agreeableness = clamp(3 + (1 if hits_social >= 3 else 0), 1, 5)

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
        "conclusion": "Попередній автоматичний аналіз виконано без зовнішнього AI. Рекомендована додаткова клінічна інтерпретація фахівця.",
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
        return json.loads(text)
    except Exception as e:
        print(f"❌ Помилка парсингу JSON: {e}\nОтримано текст: {raw_text[:100]}...")
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
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        parsed = clean_ai_json(response.text)
        return parsed or _fallback_sachs_profile(text)
    except Exception as e:
        print(f"🔥 SACHS AI ERROR: {e}")
        return _fallback_sachs_profile(text)

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
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        parsed = clean_ai_json(response.text)
        return parsed or _fallback_interview_profile(text)
    except Exception as e:
        print(f"🔥 INTERVIEW AI ERROR: {e}")
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
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        parsed = clean_ai_json(response.text)
        return parsed or _fallback_beck_analysis(total_score)
    except Exception as e:
        print(f"🔥 BECK AI ERROR: {e}")
        return _fallback_beck_analysis(total_score)