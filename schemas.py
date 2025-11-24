from pydantic import BaseModel, Field
from datetime import date
from typing import Optional


class UserCreate(BaseModel):
    name: str
    age: int
    height_cm: int
    gender: str


class WeightCreate(BaseModel):
    user_id: int
    date: date                     
    weight: float


class MeasurementCreate(BaseModel):
    user_id: int
    date: date                     
    waist_cm: float
    hips_cm: float
    neck_cm: float
    shoulder_cm: float
    chest_cm: float


class WorkoutCreate(BaseModel):
    user_id: int
    date: date                     
    name: str
    exercises_json: str
    duration: Optional[int] = None


class PRCreate(BaseModel):
    user_id: int
    exercise_name: str
    weight: float
    reps: int
    date: date                     


class GLP1Create(BaseModel):
    user_id: int
    dose_mg: float = Field(..., gt=0, description="Dose must be positive")
    date: date
    half_life_days: float = Field(..., gt=0, description="Half-life must be > 0")
    concentration: float
