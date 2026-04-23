from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.chat import MessageCreate
from app.services.chat_service import get_messages, get_user_presence, send_message

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/messages")
def post_message(msg: MessageCreate, db: Session = Depends(get_db)):
    return send_message(msg, db)


@router.get("/messages/{user1_id}/{user2_id}")
def messages(user1_id: int, user2_id: int, db: Session = Depends(get_db)):
    return get_messages(user1_id, user2_id, db)


@router.get("/presence/{user_id}")
def presence(user_id: int, db: Session = Depends(get_db)):
    return get_user_presence(user_id, db)
