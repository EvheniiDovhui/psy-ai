from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.database import User
from app.schemas.users import AssignPsychologistRequest


def get_user_info(user_id: int, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404)
    return {"status": "success", "data": {"name": user.full_name, "email": user.email, "age": user.age}}


def get_psychologists(db: Session):
    return {
        "status": "success",
        "data": [
            {
                "id": p.id,
                "name": p.full_name,
                "role": p.role,
                "phone": p.phone,
                "email": p.email,
            }
            for p in db.query(User).filter(User.role == "psychologist").all()
        ],
    }


def assign_psychologist(req: AssignPsychologistRequest, db: Session):
    patient = db.query(User).filter(User.email == req.patient_email).first()
    psychologist = (
        db.query(User)
        .filter(User.id == req.psychologist_id, User.role == "psychologist")
        .first()
    )
    if not patient or not psychologist:
        raise HTTPException(status_code=404)
    patient.psychologist_id = psychologist.id
    db.commit()
    return {"status": "success", "psychologist_name": psychologist.full_name}


def get_my_psychologist(email: str, db: Session):
    patient = db.query(User).filter(User.email == email).first()
    if not patient or not patient.psychologist_id:
        return {"status": "none"}

    psychologist = db.query(User).filter(User.id == patient.psychologist_id).first()
    if not psychologist:
        return {"status": "none"}

    return {
        "status": "success",
        "psychologist_name": psychologist.full_name,
        "psychologist_id": psychologist.id,
    }


def get_my_patients(email: str, db: Session):
    psychologist = db.query(User).filter(User.email == email, User.role == "psychologist").first()
    if not psychologist:
        return {"status": "success", "data": []}

    patients = db.query(User).filter(User.psychologist_id == psychologist.id).all()
    return {
        "status": "success",
        "data": [
            {
                "id": p.id,
                "name": p.full_name,
                "email": p.email,
                "phone": p.phone,
                "age": p.age,
            }
            for p in patients
        ],
    }
