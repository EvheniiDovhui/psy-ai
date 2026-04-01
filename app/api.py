# app/api.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any
import uvicorn
import json

# 🌟 ІМПОРТУЄМО ТВОЇ МОДУЛІ
# Додаємо наш новий AI-аналізатор з Gemini
try:
    from app.core.ai_analyzer import analyze_text_with_gemini, analyze_interview_with_gemini
    from app.core.metrics import tononi_complexity, free_energy
    from app.core.vectorization.vector_builder import (
        build_state_vector,
        compute_distance_to_expert,
        COMPONENT_ORDER
    )
except ImportError as e:
    print(f"❌ Помилка імпорту! Перевір, чи створено файл app/core/ai_analyzer.py. Error: {e}")
    # Тимчасова функція-заглушка на випадок помилки імпорту
    def analyze_text_with_gemini(t): 
        return {
            "big_five": {"neuroticism": 3, "extraversion": 3, "openness": 3, "agreeableness": 3, "conscientiousness": 3},
            "maslow": {"physiological": 3, "safety": 3, "love": 3, "esteem": 3, "self_actualization": 3},
            "schwartz": {"power": 2, "achievement": 2, "hedonism": 2, "security": 2, "benevolence": 2, "universalism": 2, "self_direction": 2, "stimulation": 2, "conformity": 2, "tradition": 2},
            "conclusion": "Помилка підключення AI-модуля. Перевірте наявність файлу ai_analyzer.py та ключа API."
        }
    def tononi_complexity(b5): return 0.0
    def free_energy(b5): return 0.0

app = FastAPI(title="PSY-AI Brain Core")

# Налаштування CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SachSentence(BaseModel):
    prompt: str
    answer: str

class SachsTestPayload(BaseModel):
    testName: str
    timestamp: str
    results: Dict[str, List[SachSentence]]

@app.post("/api/analyze-sachs")
async def analyze_sachs_test(data: SachsTestPayload):
    try:
        # 1. Склеюємо текст тесту
        combined_text = ""
        for category, sentences in data.results.items():
            for item in sentences:
                if item.answer.strip():
                    combined_text += f"{item.prompt} {item.answer}. "

        if not combined_text.strip():
            raise HTTPException(status_code=400, detail="Тест порожній")

        print(f"🔮 Запуск AI-аналізу через Gemini для: {data.testName}...")

        # 2. 🚀 ВИКЛИКАЄМО GEMINI АНАЛІЗАТОР
        # Тепер ми отримуємо об'єкт, у якому Є поле 'conclusion'
        profile_data = analyze_text_with_gemini(combined_text)

        if not profile_data:
            raise HTTPException(status_code=500, detail="AI аналізатор повернув порожній результат")

        # 3. Рахуємо твої математичні метрики
        b5 = profile_data.get("big_five", {})
        try:
            if not isinstance(b5, dict):
                # Запобіжник, якщо AI повернув некоректний тип (наприклад int замість об'єкта)
                b5 = {"default": 1.0}
            elif not b5:
                # Запобіжник, якщо пустий словник
                b5 = {"default": 1.0}

            consciousness = tononi_complexity(b5)
            energy = free_energy(b5)
        except Exception as metric_err:
            print(f"Помилка при розрахунку метрик: {metric_err}")
            consciousness = 0.0
            energy = 0.0

        # 4. Будуємо state vector для розширеної аналітики
        try:
            state_vector = build_state_vector(profile_data, label=data.testName, normalize=True)
            distance_to_expert = compute_distance_to_expert(state_vector.vector)

            # Конвертуємо numpy arrays у списки для JSON
            vector_data = {
                "vector": state_vector.vector.tolist(),
                "components": {k: v.tolist() for k, v in state_vector.components.items()},
                "distance_to_expert": float(distance_to_expert),
                "label": state_vector.label
            }
        except Exception as e:
            print(f"⚠️  Помилка при побудові вектора: {e}")
            vector_data = None

        # 5. Відправляємо ПОВНИЙ об'єкт (з conclusion та vector data) на фронтенд
        return {
            "status": "success",
            "metrics": {
                "tononi_complexity": consciousness,
                "free_energy": energy
            },
            "profile": profile_data,
            "vector_data": vector_data
        }

    except Exception as e:
        print(f"❌ Критична помилка бекенду: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class InterviewPayload(BaseModel):
    text: str

@app.post("/api/analyze-interview")
async def analyze_interview(data: InterviewPayload):
    try:
        if not data.text or len(data.text) < 20:
            raise HTTPException(status_code=400, detail="Текст занадто короткий для аналізу")
            
        result = analyze_interview_with_gemini(data.text)
        if not result:
            raise HTTPException(status_code=500, detail="AI Analysis failed")

        # Додаємо vector data для інтерв'ю, якщо AI повернув профіль
        vector_data = None
        if "big_five" in result and "maslow" in result and "schwartz" in result:
            try:
                state_vector = build_state_vector(result, label="Первинне інтерв'ю", normalize=True)
                distance_to_expert = compute_distance_to_expert(state_vector.vector)
                vector_data = {
                    "vector": state_vector.vector.tolist(),
                    "components": {k: v.tolist() for k, v in state_vector.components.items()},
                    "distance_to_expert": float(distance_to_expert),
                    "label": state_vector.label
                }
            except Exception as e:
                print(f"⚠️  Помилка при побудові вектора для інтерв'ю: {e}")

        return {
            "status": "success",
            "data": result,
            "vector_data": vector_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app.api:app", host="0.0.0.0", port=8000, reload=True)