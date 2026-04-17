from pydantic import BaseModel


class AssignPsychologistRequest(BaseModel):
    patient_email: str
    psychologist_id: int
