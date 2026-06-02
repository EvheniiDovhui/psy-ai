from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.tests import BeckPayload, CopingPayload, InterviewPayload, SachsTestPayload, TestResultCreate
from app.services.test_service import (
    analyze_beck,
    analyze_coping,
    analyze_interview,
    analyze_sachs_test,
    build_full_profile,
    get_test_results,
    save_test_result,
)

router = APIRouter(prefix="/api", tags=["tests"])


@router.post("/analyze-interview")
async def analyze_interview_endpoint(data: InterviewPayload):
    try:
        return await analyze_interview(data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-sachs")
async def analyze_sachs_test_endpoint(data: SachsTestPayload):
    try:
        return await analyze_sachs_test(data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-beck")
async def analyze_beck_endpoint(data: BeckPayload):
    try:
        return await analyze_beck(data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-coping")
async def analyze_coping_endpoint(data: CopingPayload):
    try:
        return await analyze_coping(data.answers)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save-test-result")
def save_test_result_endpoint(req: TestResultCreate, db: Session = Depends(get_db)):
    return save_test_result(req, db)


@router.get("/test-results/{user_id}")
def test_results(user_id: int, db: Session = Depends(get_db)):
    return get_test_results(user_id, db)


@router.get("/full-profile/{user_id}")
def full_profile(user_id: int, force: bool = Query(False), db: Session = Depends(get_db)):
    try:
        return build_full_profile(user_id, db, force_refresh=force)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Backward-compatible exports used by direct imports from app.api
analyze_interview_api = analyze_interview_endpoint
analyze_sachs_test_api = analyze_sachs_test_endpoint
analyze_beck_api = analyze_beck_endpoint
analyze_coping_api = analyze_coping_endpoint
