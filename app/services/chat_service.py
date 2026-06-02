from datetime import datetime, timedelta, timezone

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.core.database import Message
from app.core.settings import DISPLAY_TIMEZONE, ONLINE_WINDOW_MINUTES
from app.schemas.chat import MessageCreate


def _to_display_time(dt):
    if dt is None:
        return None

    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(DISPLAY_TIMEZONE)


def send_message(msg: MessageCreate, db: Session):
    new_msg = Message(sender_id=msg.sender_id, receiver_id=msg.receiver_id, text=msg.text)
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return {"status": "success"}


def get_messages(user1_id: int, user2_id: int, db: Session):
    messages = (
        db.query(Message)
        .filter(
            or_(
                and_(Message.sender_id == user1_id, Message.receiver_id == user2_id),
                and_(Message.sender_id == user2_id, Message.receiver_id == user1_id),
            )
        )
        .order_by(Message.timestamp.asc())
        .all()
    )

    return {
        "status": "success",
        "data": [
            {
                "id": m.id,
                "sender_id": m.sender_id,
                "text": m.text,
                "time": _to_display_time(m.timestamp).strftime("%H:%M"),
                "timestamp": _to_display_time(m.timestamp).isoformat(),
            }
            for m in messages
        ],
    }


def get_user_presence(user_id: int, db: Session):
    last_outgoing = (
        db.query(Message)
        .filter(Message.sender_id == user_id)
        .order_by(Message.timestamp.desc())
        .first()
    )

    if not last_outgoing or not last_outgoing.timestamp:
        return {"status": "success", "is_online": False, "last_seen": None}

    last_seen = last_outgoing.timestamp
    if last_seen.tzinfo is None:
        last_seen = last_seen.replace(tzinfo=timezone.utc)

    now_utc = datetime.now(timezone.utc)
    is_online = (now_utc - last_seen) <= timedelta(minutes=ONLINE_WINDOW_MINUTES)
    last_seen_local = last_seen.astimezone(DISPLAY_TIMEZONE)

    return {
        "status": "success",
        "is_online": is_online,
        "last_seen": last_seen_local.isoformat(),
        "last_seen_time": last_seen_local.strftime("%H:%M"),
    }
