# app/core/ai_analyzer.py
from google import genai
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Ініціалізація клієнта Gemini 2.5 Flash
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_ID = 'models/gemini-2.5-flash'

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
<<<<<<< Updated upstream
    Проаналізуй тест Сакса-Леві. Оціни показники від 1 до 5.
    Текст: "{text}"
    Поверни ТІЛЬКИ чистий JSON:
    {{
        "big_five": {{"neuroticism": 1-5, "extraversion": 1-5, "openness": 1-5, "agreeableness": 1-5, "conscientiousness": 1-5}},
        "maslow": {{"physiological": 1-5, "safety": 1-5, "love": 1-5, "esteem": 1-5, "self_actualization": 1-5}},
        "schwartz": {{"power": 1-5, "achievement": 1-5, "hedonism": 1-5, "security": 1-5, "benevolence": 1-5, "universalism": 1-5, "self_direction": 1-5, "stimulation": 1-5, "conformity": 1-5, "tradition": 1-5}},
        "conclusion": "Твій психологічний висновок..."
    }}
    """
    try:
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        return clean_ai_json(response.text)
    except Exception as e:
        print(f"🔥 SACHS AI ERROR: {e}")
        return None

=======
    Ти — професійний психолог. Проаналізуй результати тесту незакінчених речень (Сакса-Леві).
    
    ОЦІНКА:
    Проаналізуй кожне речення в контексті. Оціни за шкалою 1-5 (де 5 - найвищий прояв) наступні параметри:
    1. Big Five (neuroticism, openness, conscientiousness, extraversion, agreeableness)
    2. Maslow (physiological, safety, love, esteem, self_actualization)
    3. Schwartz (power, achievement, hedonism, security, benevolence, universalism)

    ТЕКСТ ТЕСТУ:
    "{text}"

    ПОВЕРНИ ТІЛЬКИ JSON:
    {{
        "big_five": {{"neuroticism": x, "openness": x, ...}},
        "maslow": {{...}},
        "schwartz": {{...}},
        "conclusion": "короткий психологічний портрет на основі цілісних речень"
    }}
    """
# ЦЯ ФУНКЦІЯ ТАКОЖ МАЄ БУТИ ТУТ (для інтерв'ю)
>>>>>>> Stashed changes
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
    try:
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        return clean_ai_json(response.text)
    except Exception as e:
        print(f"🔥 INTERVIEW AI ERROR: {e}")
        return None

# Додай в кінець файлу app/core/ai_analyzer.py

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
    try:
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        return clean_ai_json(response.text)
    except Exception as e:
        print(f"🔥 BECK AI ERROR: {e}")
        return None