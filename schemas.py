# schemas.py
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


# --- shared helpers ---------------------------------------------------------

def _validate_date_str(value: str) -> str:
    """
    Ensure date is in strict YYYY-MM-DD format.
    """
    try:
        datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        raise ValueError("date must be in YYYY-MM-DD format (e.g., 2025-11-24)")
    return value


def _normalise_gender(value: str) -> str:
    """
    Normalise gender to lowercase 'male' / 'female' / 'other' bucket.
    You can tighten this later if you want.
    """
    v = value.strip().lower()
    if v in ("m", "man", "male"):
        return "male"
    if v in ("f", "woman", "female"):
        return "female"
    # keep as-is but non-empty
    if not v:
        raise ValueError("gender must not be empty")
    return v


# --- user -------------------------------------------------------------------

class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    age: int = Field(gt=0, lt=130)
    height_cm: int = Field(gt=80, lt=260)  # adjust if you like
    gender: str

    @field_validator("gender")
    def validate_gender(cls, v: str) -> str:
        return _normalise_gender(v)


# --- weight -----------------------------------------------------------------

class WeightCreate(BaseModel):
    user_id: int = Field(gt=0)
    date: str
    weight: float = Field(gt=20.0, lt=400.0)  # sane-ish human range

    @field_validator("date")
    def validate_date(cls, v: str) -> str:
        return _validate_date_str(v)


# --- measurements -----------------------------------------------------------

class MeasurementCreate(BaseModel):
    user_id: int = Field(gt=0)
    date: str
    waist_cm: float = Field(gt=20.0, lt=300.0)
    hips_cm: float = Field(gt=20.0, lt=300.0)
    neck_cm: float = Field(gt=10.0, lt=80.0)
    shoulder_cm: float = Field(gt=20.0, lt=300.0)
    chest_cm: float = Field(gt=20.0, lt=300.0)

    @field_validator("date")
    def validate_date(cls, v: str) -> str:
        return _validate_date_str(v)


# --- workouts ---------------------------------------------------------------

class WorkoutCreate(BaseModel):
    user_id: int = Field(gt=0)
    date: str
    name: str = Field(min_length=1, max_length=100)
    exercises_json: str = Field(min_length=1)
    duration: Optional[int] = Field(default=None, gt=0, lt=24 * 60)  # minutes

    @field_validator("date")
    def validate_date(cls, v: str) -> str:
        return _validate_date_str(v)


# --- PRs --------------------------------------------------------------------

class PRCreate(BaseModel):
    user_id: int = Field(gt=0)
    exercise_name: str = Field(min_length=1, max_length=100)
    weight: float = Field(gt=0, lt=500.0)
    reps: int = Field(gt=0, lt=100)
    date: str

    @field_validator("date")
    def validate_date(cls, v: str) -> str:
        return _validate_date_str(v)


# --- GLP-1 ------------------------------------------------------------------

class GLP1Create(BaseModel):
    user_id: int = Field(gt=0)
    dose_mg: float = Field(gt=0.0, lt=100.0)
    date: str
    half_life_days: float = Field(gt=0.0, lt=100.0)
    concentration: float = Field(gt=0.0)  # initial C0; can be == dose_mg

    @field_validator("date")
    def validate_date(cls, v: str) -> str:
        return _validate_date_str(v)
