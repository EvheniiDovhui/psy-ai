# app/core/ai_analyzer.py
from google import genai
import json
import os
from dotenv import load_dotenv

# Завантажуємо .env
load_dotenv()

# Ініціалізація клієнта Gemini 2026
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_ID = 'models/gemini-2.5-flash'

def clean_ai_json(raw_text):
    """Допоміжна функція для очищення JSON від маркдауну AI"""
    try:
        text = raw_text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        return json.loads(text)
    except Exception as e:
        print(f"❌ Помилка парсингу JSON: {e}")
        return None

# ЦЯ ФУНКЦІЯ МАЄ БУТИ ТУТ (для Сакса-Леві)
def analyze_text_with_gemini(text: str):
    prompt = f"""
    Ти — психолог-аналітик. Оціни тест Сакса-Леві за шкалою 1-5.
    Текст: "{text}"
    Поверни ТІЛЬКИ чистий JSON з ключами: big_five, maslow, schwartz, conclusion.
    """
    try:
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        return clean_ai_json(response.text)
    except Exception as e:
        print(f"🔥 SACHS ERROR: {e}")
        return None

# ЦЯ ФУНКЦІЯ ТАКОЖ МАЄ БУТИ ТУТ (для інтерв'ю)
def analyze_interview_with_gemini(text: str):
    prompt = f"""
    Ти — психотерапевт. Проаналізуй первинне інтерв'ю: "{text}"
    Видай JSON з ключами: scores, core_request, markers, clinical_summary.
    """
    try:
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        return clean_ai_json(response.text)
    except Exception as e:
        print(f"🔥 INTERVIEW ERROR: {e}")
        return None