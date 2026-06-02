from pydantic import BaseModel


class MessageCreate(BaseModel):
    sender_id: int
    receiver_id: int
    text: str
