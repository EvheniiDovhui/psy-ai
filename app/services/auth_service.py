from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.auth import create_access_token, get_password_hash, verify_password
from app.core.database import User
from app.schemas.auth import UserCreate, UserLogin


def register_user(user: UserCreate, db: Session):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email вже існує")

    new_user = User(
        full_name=user.full_name,
        age=user.age,
        phone=user.phone,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        role=user.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(
        data={"sub": new_user.email, "role": new_user.role, "id": new_user.id}
    )
    return {
        "status": "success",
        "token": access_token,
        "role": new_user.role,
        "name": new_user.full_name,
        "email": new_user.email,
        "id": new_user.id,
    }


def login_user(user: UserLogin, db: Session):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Невірно")

    access_token = create_access_token(
        data={"sub": db_user.email, "role": db_user.role, "id": db_user.id}
    )
    return {
        "status": "success",
        "token": access_token,
        "role": db_user.role,
        "name": db_user.full_name,
        "email": db_user.email,
        "id": db_user.id,
    }
