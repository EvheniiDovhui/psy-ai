from pydantic import BaseModel


class UserCreate(BaseModel):
    full_name: str
    age: int
    phone: str
    email: str
    password: str
    role: str


class UserLogin(BaseModel):
    email: str
    password: str
