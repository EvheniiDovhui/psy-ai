# app/api.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any
import uvicorn
import json

# =========================================================================
# 🌟 ІМПОРТ ТВОЇХ ІСНУЮЧИХ МОДУЛІВ
try:
    from app.core.analyzer import analyze_text
    from app.core.metrics import tononi_complexity, free_energy
except ImportError as e:
    print(f"❌ Помилка імпорту твоїх модулів! Перевір структуру папок. Error: {e}")
    # Це заглушка
    def analyze_text(t): return type('Profile', (object,), {"to_dict": lambda: {"big_five": {"neuroticism": 0.5, "extraversion": 0.6, "openness": 0.7, "agreeableness": 0.8, "conscientiousness": 0.4}}})()
    def tononi_complexity(b5): return 0.1234
    def free_energy(b5): return 0.5678

# =========================================================================

app = FastAPI(title="PSY-AI Brain Core", description="API для психологічного аналізу")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
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
        combined_text = ""
        for category, sentences in data.results.items():
            for item in sentences:
                if item.answer.strip(): 
                    combined_text += f"{item.prompt} {item.answer}. "

        if not combined_text.strip():
            raise HTTPException(status_code=400, detail="Тест порожній")

        print(f"🔮 Аналіз тесту '{data.testName}' від {data.timestamp}. Текст: {combined_text[:50]}...")

        # 2. 🌟 ЗАПУСКАЄМО ТВІЙ АНАЛІЗАТОР
        profile = analyze_text(combined_text)
        profile_data = profile.to_dict()

        # =====================================================================
        # 🛑 ОСЬ ТУТ МИ ВИВОДИМО ДАНІ В ТЕРМІНАЛ ДЛЯ ПЕРЕВІРКИ
        print("\n" + "="*50)
        print("📊 СТРУКТУРА ДАНИХ ВІД АНАЛІЗАТОРА (profile_data):")
        print(json.dumps(profile_data, indent=2, ensure_ascii=False))
        print("="*50 + "\n")
        # =====================================================================

        # 3. 🌟 РАХУЄМО ТВОЇ МЕТРИКИ
        b5 = profile_data.get("big_five", {})
        consciousness = tononi_complexity(b5)
        energy = free_energy(b5)

        # 4. Повертаємо JSON на фронтенд
        return {
            "status": "success",
            "metrics": {
                "tononi_complexity": consciousness,
                "free_energy": energy
            },
            "profile": profile_data
        }

    except Exception as e:
        print(f"❌ Критична помилка бекенду: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app.api:app", host="0.0.0.0", port=8000, reload=True)