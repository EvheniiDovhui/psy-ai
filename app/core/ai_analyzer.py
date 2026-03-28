# app/core/ai_analyzer.py
from google import genai
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Ініціалізація клієнта
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_text_with_gemini(text: str):
    # Використовуємо СУПЕР-НОВУ модель з твого списку
    MODEL_ID = 'models/gemini-2.5-flash' 
    
    prompt = f"""
    Ти — професійний психолог-аналітик. 
    Проаналізуй відповіді тесту: "{text}"
    
    Оціни кожну категорію від 1 до 5. НЕ використовуй 0.
    
    Відповідь надай ТІЛЬКИ у форматі JSON:
    {{
        "big_five": {{"neuroticism": 1-5, "extraversion": 1-5, "openness": 1-5, "agreeableness": 1-5, "conscientiousness": 1-5}},
        "maslow": {{"physiological": 1-5, "safety": 1-5, "love": 1-5, "esteem": 1-5, "self_actualization": 1-5}},
        "schwartz": {{"power": 1-5, "achievement": 1-5, "hedonism": 1-5, "security": 1-5, "benevolence": 1-5, "universalism": 1-5, "self_direction": 1-5, "stimulation": 1-5, "conformity": 1-5, "tradition": 1-5}},
        "conclusion": "Твій емпатичний висновок українською мовою з порадою звернутися до психолога."
    }}
    """

    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt
        )
        
        res_text = response.text.strip()
        
        # Очищення від маркдауну ```json
        if "```" in res_text:
            res_text = res_text.split("```")[1]
            if res_text.startswith("json"):
                res_text = res_text[4:].strip()
        
        return json.loads(res_text)
        
    except Exception as e:
        print(f"🔥 AI ERROR: {str(e)}")
        return None