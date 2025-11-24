from fastapi import APIRouter, Depends
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
    db_log = models.Workout(
        user_id=workout.user_id,
        date=workout.date.isoformat(),  
        name=workout.name,
        exercises_json=workout.exercises_json,
        duration=workout.duration,
    )
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
