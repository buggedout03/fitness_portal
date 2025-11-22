from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    name: str
    age: int
    height_cm: int
    gender: str

class WeightCreate(BaseModel):
    user_id: int
    date: str
    weight: float

class MeasurementCreate(BaseModel):
    user_id: int
    date: str
    waist_cm: float
    hips_cm: float
    neck_cm: float
    shoulder_cm: float
    chest_cm: float

class WorkoutCreate(BaseModel):
    user_id: int
    date: str
    name: str
    exercises_json: str
    duration: Optional[int] = None

class PRCreate(BaseModel):
    user_id: int
    exercise_name: str
    weight: float
    reps: int
    date: str

class GLP1Create(BaseModel):
    user_id: int
    dose_mg: float
    date: str
    half_life_days: float
    concentration: float
