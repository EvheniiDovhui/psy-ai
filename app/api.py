# app/api.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
import uvicorn

from app.core.database import engine, Base, get_db, User, TestResult, Message
from app.core.auth import get_password_hash, verify_password, create_access_token
from app.core.ai_analyzer import analyze_text_with_gemini, analyze_interview_with_gemini, analyze_beck_with_gemini
from app.core.metrics import tononi_complexity, free_energy

Base.metadata.create_all(bind=engine)

app = FastAPI(title="PSY-AI Brain Core")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 1. МОДЕЛІ ДАНИХ (Pydantic)
# ==========================================

class AssignPsychologistRequest(BaseModel):
    patient_email: str
    psychologist_id: int

class UserCreate(BaseModel):
    full_name: str; age: int; phone: str; email: str; password: str; role: str

class UserLogin(BaseModel):
    email: str; password: str

class MessageCreate(BaseModel):
    sender_id: int
    receiver_id: int
    text: str

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

class TestResultCreate(BaseModel):
    user_id: int
    test_type: str
    ai_response: str

# ==========================================
# 2. АВТОРИЗАЦІЯ
# ==========================================

@app.post("/api/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first(): 
        raise HTTPException(status_code=400, detail="Email вже існує")
    
    new_user = User(
        full_name=user.full_name, age=user.age, phone=user.phone, 
        email=user.email, hashed_password=get_password_hash(user.password), role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.email, "role": new_user.role, "id": new_user.id})
    return {"status": "success", "token": access_token, "role": new_user.role, "name": new_user.full_name, "email": new_user.email, "id": new_user.id}

@app.post("/api/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password): 
        raise HTTPException(status_code=401, detail="Невірно")
    
    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role, "id": db_user.id})
    return {"status": "success", "token": access_token, "role": db_user.role, "name": db_user.full_name, "email": db_user.email, "id": db_user.id}


# ==========================================
# 3. КОРИСТУВАЧІ ТА ПСИХОЛОГИ
# ==========================================

@app.get("/api/user/{user_id}")
def get_user_info(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(status_code=404)
    return {"status": "success", "data": {"name": user.full_name, "email": user.email, "age": user.age}}

@app.get("/api/psychologists")
def get_psychologists(db: Session = Depends(get_db)):
    return {"status": "success", "data": [{"id": p.id, "name": p.full_name, "phone": p.phone, "email": p.email} for p in db.query(User).filter(User.role == "psychologist").all()]}

@app.post("/api/assign-psychologist")
def assign_psychologist(req: AssignPsychologistRequest, db: Session = Depends(get_db)):
    patient = db.query(User).filter(User.email == req.patient_email).first()
    psychologist = db.query(User).filter(User.id == req.psychologist_id).first()
    if not patient or not psychologist: raise HTTPException(status_code=404)
    patient.psychologist_id = psychologist.id
    db.commit()
    return {"status": "success", "psychologist_name": psychologist.full_name}

@app.get("/api/my-psychologist/{email}")
def get_my_psychologist(email: str, db: Session = Depends(get_db)):
    patient = db.query(User).filter(User.email == email).first()
    if not patient or not patient.psychologist_id: return {"status": "none"}
    psychologist = db.query(User).filter(User.id == patient.psychologist_id).first()
    if not psychologist: return {"status": "none"}
    return {"status": "success", "psychologist_name": psychologist.full_name, "psychologist_id": psychologist.id}

@app.get("/api/my-patients/{email}")
def get_my_patients(email: str, db: Session = Depends(get_db)):
    psychologist = db.query(User).filter(User.email == email, User.role == "psychologist").first()
    if not psychologist: return {"status": "success", "data": []}
    patients = db.query(User).filter(User.psychologist_id == psychologist.id).all()
    return {"status": "success", "data": [{"id": p.id, "name": p.full_name, "email": p.email, "phone": p.phone, "age": p.age} for p in patients]}


# ==========================================
# 4. ЧАТ
# ==========================================

@app.post("/api/messages")
def send_message(msg: MessageCreate, db: Session = Depends(get_db)):
    new_msg = Message(sender_id=msg.sender_id, receiver_id=msg.receiver_id, text=msg.text)
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return {"status": "success"}

@app.get("/api/messages/{user1_id}/{user2_id}")
def get_messages(user1_id: int, user2_id: int, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == user1_id, Message.receiver_id == user2_id),
            and_(Message.sender_id == user2_id, Message.receiver_id == user1_id)
        )
    ).order_by(Message.timestamp.asc()).all()
    return {"status": "success", "data": [{"id": m.id, "sender_id": m.sender_id, "text": m.text, "time": m.timestamp.strftime("%H:%M")} for m in messages]}


# ==========================================
# 5. ТЕСТИ ТА АНАЛІЗ AI (ВІДНОВЛЕНО!)
# ==========================================

@app.post("/api/analyze-interview")
async def analyze_interview(data: InterviewPayload):
    try:
        if len(data.text) < 10: raise HTTPException(status_code=400, detail="Текст занадто короткий")
        result = analyze_interview_with_gemini(data.text)
        if not result: raise HTTPException(status_code=500, detail="Помилка генерації AI")
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-sachs")
async def analyze_sachs_test(data: SachsTestPayload):
    try:
        combined_text = " ".join([f"{item.prompt} {item.answer}." for cat, items in data.results.items() for item in items if item.answer.strip()])
        if not combined_text.strip(): raise HTTPException(status_code=400, detail="Тест порожній")
        profile_data = analyze_text_with_gemini(combined_text)
        if not profile_data: raise HTTPException(status_code=500, detail="Помилка генерації AI")
        b5 = profile_data.get("big_five", {})
        return {
            "status": "success",
            "metrics": { "tononi_complexity": tononi_complexity(b5), "free_energy": free_energy(b5) },
            "profile": profile_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-beck")
async def analyze_beck(data: BeckPayload):
    try:
        result = analyze_beck_with_gemini(data.total_score, data.answers_summary)
        if not result: raise HTTPException(status_code=500, detail="AI Analysis failed")
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/save-test-result")
def save_test_result(req: TestResultCreate, db: Session = Depends(get_db)):
    """Зберігає результат проходження тесту в базу"""
    new_result = TestResult(
        user_id=req.user_id, 
        test_type=req.test_type, 
        ai_response=req.ai_response
    )
    db.add(new_result)
    db.commit()
    return {"status": "success"}

@app.get("/api/test-results/{user_id}")
def get_test_results(user_id: int, db: Session = Depends(get_db)):
    """Отримує всі збережені тести конкретного пацієнта"""
    results = db.query(TestResult).filter(TestResult.user_id == user_id).order_by(TestResult.created_at.desc()).all()
    
    data = []
    for r in results:
        data.append({
            "id": r.id,
            "test_type": r.test_type,
            "ai_response": r.ai_response,
            "date": r.created_at.strftime("%d.%m.%Y %H:%M")
        })
    return {"status": "success", "data": data}
# ==========================================
# 6. ЗАПУСК
# ==========================================
if __name__ == "__main__":
    uvicorn.run("app.api:app", host="0.0.0.0", port=8000, reload=True)