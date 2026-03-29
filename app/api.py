# app/api.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any
import uvicorn

# Глобальні імпорти
from app.core.ai_analyzer import analyze_text_with_gemini, analyze_interview_with_gemini
from app.core.metrics import tononi_complexity, free_energy
from app.core.ai_analyzer import analyze_text_with_gemini, analyze_interview_with_gemini, analyze_beck_with_gemini

app = FastAPI(title="PSY-AI Brain Core")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Моделі ---
class SachSentence(BaseModel):
    prompt: str
    answer: str

class SachsTestPayload(BaseModel):
    testName: str
    timestamp: str
    results: Dict[str, List[SachSentence]]

class InterviewPayload(BaseModel):
    text: str

class BeckPayload(BaseModel):
    total_score: int
    answers_summary: str

# --- Роути ---
@app.post("/api/analyze-sachs")
async def analyze_sachs_test(data: SachsTestPayload):
    try:
        combined_text = " ".join([f"{item.prompt} {item.answer}." for cat, items in data.results.items() for item in items if item.answer.strip()])
        
        if not combined_text.strip():
            raise HTTPException(status_code=400, detail="Тест порожній")

        profile_data = analyze_text_with_gemini(combined_text)
        if not profile_data:
            raise HTTPException(status_code=500, detail="Помилка генерації AI (Sachs)")

        b5 = profile_data.get("big_five", {})
        return {
            "status": "success",
            "metrics": {
                "tononi_complexity": tononi_complexity(b5),
                "free_energy": free_energy(b5)
            },
            "profile": profile_data
        }
    except Exception as e:
        print(f"🔥 API ERROR (Sachs): {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-interview")
async def analyze_interview(data: InterviewPayload):
    try:
        if len(data.text) < 10:
            raise HTTPException(status_code=400, detail="Текст занадто короткий")
            
        result = analyze_interview_with_gemini(data.text)
        
        if not result:
            raise HTTPException(status_code=500, detail="Помилка генерації AI (Interview)")
            
        return {"status": "success", "data": result}
    except Exception as e:
        print(f"🔥 API ERROR (Interview): {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app.api:app", host="0.0.0.0", port=8000, reload=True)

@app.post("/api/analyze-beck")
async def analyze_beck(data: BeckPayload):
    try:
        result = analyze_beck_with_gemini(data.total_score, data.answers_summary)
        
        if not result:
            raise HTTPException(status_code=500, detail="AI Analysis failed for Beck Test")
            
        return {"status": "success", "data": result}
    except Exception as e:
        print(f"🔥 API ERROR (Beck): {e}")
        raise HTTPException(status_code=500, detail=str(e))