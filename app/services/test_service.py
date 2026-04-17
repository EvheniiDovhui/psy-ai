from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.ai_analyzer import (
    analyze_beck_with_gemini,
    analyze_interview_with_gemini,
    analyze_text_with_gemini,
)
from app.core.database import TestResult
from app.core.metrics import free_energy, tononi_complexity
from app.services.chat_service import _to_display_time
from app.schemas.tests import BeckPayload, InterviewPayload, SachsTestPayload, TestResultCreate


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
        data.append(
            {
                "id": r.id,
                "test_type": r.test_type,
                "ai_response": r.ai_response,
                "date": local_dt.strftime("%d.%m.%Y %H:%M"),
            }
        )
    return {"status": "success", "data": data}
