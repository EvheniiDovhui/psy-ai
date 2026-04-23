from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.users import AssignPsychologistRequest
from app.services.user_service import (
    assign_psychologist,
    get_my_patients,
    get_my_psychologist,
    get_psychologists,
    get_user_info,
)

router = APIRouter(prefix="/api", tags=["users"])


@router.get("/user/{user_id}")
def user_info(user_id: int, db: Session = Depends(get_db)):
    return get_user_info(user_id, db)


@router.get("/psychologists")
def psychologists(db: Session = Depends(get_db)):
    return get_psychologists(db)


@router.post("/assign-psychologist")
def assign(req: AssignPsychologistRequest, db: Session = Depends(get_db)):
    return assign_psychologist(req, db)


@router.get("/my-psychologist/{email}")
def my_psychologist(email: str, db: Session = Depends(get_db)):
    return get_my_psychologist(email, db)


@router.get("/my-patients/{email}")
def my_patients(email: str, db: Session = Depends(get_db)):
    return get_my_patients(email, db)
