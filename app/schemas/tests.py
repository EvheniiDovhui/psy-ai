from typing import Dict, List
from pydantic import BaseModel


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


class CopingPayload(BaseModel):
    answers: List[int]


class TestResultCreate(BaseModel):
    user_id: int
    test_type: str
    ai_response: str
