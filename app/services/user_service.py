from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.database import User, UserPsychologistLink
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
    patient = db.query(User).filter(User.email == req.patient_email, User.role == "patient").first()
    psychologist = (
        db.query(User)
        .filter(User.id == req.psychologist_id, User.role == "psychologist")
        .first()
    )
    if not patient or not psychologist:
        raise HTTPException(status_code=404)

    existing_link = (
        db.query(UserPsychologistLink)
        .filter(
            UserPsychologistLink.patient_id == patient.id,
            UserPsychologistLink.psychologist_id == psychologist.id,
        )
        .first()
    )
    if not existing_link:
        db.add(
            UserPsychologistLink(
                patient_id=patient.id,
                psychologist_id=psychologist.id,
            )
        )

    # Keep legacy field synchronized to latest selected specialist.
    patient.psychologist_id = psychologist.id
    db.commit()
    return {"status": "success", "psychologist_name": psychologist.full_name}


def get_my_psychologists(email: str, db: Session):
    patient = db.query(User).filter(User.email == email, User.role == "patient").first()
    if not patient:
        return {"status": "none", "data": []}

    links = (
        db.query(UserPsychologistLink)
        .filter(UserPsychologistLink.patient_id == patient.id)
        .order_by(UserPsychologistLink.created_at.desc())
        .all()
    )

    psychologist_ids = [link.psychologist_id for link in links]
    if patient.psychologist_id and patient.psychologist_id not in psychologist_ids:
        psychologist_ids.append(patient.psychologist_id)

    if not psychologist_ids:
        return {"status": "none", "data": []}

    psychologists = db.query(User).filter(User.id.in_(psychologist_ids), User.role == "psychologist").all()
    by_id = {psy.id: psy for psy in psychologists}

    ordered = []
    seen = set()
    for pid in psychologist_ids:
        if pid in seen or pid not in by_id:
            continue
        seen.add(pid)
        psy = by_id[pid]
        ordered.append(
            {
                "psychologist_id": psy.id,
                "psychologist_name": psy.full_name,
                "psychologist_email": psy.email,
                "psychologist_phone": psy.phone,
            }
        )

    if not ordered:
        return {"status": "none", "data": []}

    return {
        "status": "success",
        "data": ordered,
    }


def get_my_psychologist(email: str, db: Session):
    all_psy = get_my_psychologists(email, db)
    if all_psy.get("status") != "success" or not all_psy.get("data"):
        return {"status": "none"}

    first = all_psy["data"][0]

    return {
        "status": "success",
        "psychologist_name": first["psychologist_name"],
        "psychologist_id": first["psychologist_id"],
        "psychologists": all_psy["data"],
    }


def get_my_patients(email: str, db: Session):
    psychologist = db.query(User).filter(User.email == email, User.role == "psychologist").first()
    if not psychologist:
        return {"status": "success", "data": []}

    linked_patient_ids = [
        row.patient_id
        for row in db.query(UserPsychologistLink)
        .filter(UserPsychologistLink.psychologist_id == psychologist.id)
        .all()
    ]

    legacy_ids = [
        row.id
        for row in db.query(User)
        .filter(User.psychologist_id == psychologist.id, User.role == "patient")
        .all()
    ]

    patient_ids = list(dict.fromkeys(linked_patient_ids + legacy_ids))
    if not patient_ids:
        return {"status": "success", "data": []}

    patients = db.query(User).filter(User.id.in_(patient_ids), User.role == "patient").all()

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
