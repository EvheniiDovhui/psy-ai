# app/api.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.core.database import Base, engine
from app.core.settings import CORS_ORIGINS
from app.routers.auth import router as auth_router
from app.routers.chat import router as chat_router
from app.routers.tests import (
    analyze_beck_api as analyze_beck,
    analyze_coping_api as analyze_coping,
    analyze_interview_api as analyze_interview,
    analyze_sachs_test_api as analyze_sachs_test,
    router as tests_router,
)
from app.routers.users import router as users_router
from app.schemas.tests import BeckPayload, CopingPayload, InterviewPayload, SachSentence, SachsTestPayload, TestResultCreate

Base.metadata.create_all(bind=engine)

app = FastAPI(title="PSY-AI Brain Core")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(chat_router)
app.include_router(tests_router)


# Legacy exports used by direct imports in scripts/tests.
__all__ = [
    "app",
    "SachSentence",
    "SachsTestPayload",
    "InterviewPayload",
    "BeckPayload",
    "CopingPayload",
    "TestResultCreate",
    "analyze_interview",
    "analyze_sachs_test",
    "analyze_beck",
    "analyze_coping",
]


if __name__ == "__main__":
    uvicorn.run("app.api:app", host="0.0.0.0", port=8000, reload=True)