from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import database, schemas, models

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/add")
def add_workout(workout: schemas.WorkoutCreate, db: Session = Depends(get_db)):
    # Ensure the string is valid JSON to avoid later surprises
    try:
        parsed = json.loads(workout.exercises_json)
        if not isinstance(parsed, list):
            raise ValueError("exercises_json must be a JSON array")
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid exercises_json: {e}"
        )

    db_log = models.Workout(**workout.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/list")
def list_workouts(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Workout)
        .filter(models.Workout.user_id == user_id)
        .order_by(models.Workout.date.desc(), models.Workout.id.desc())
        .all()
    )
