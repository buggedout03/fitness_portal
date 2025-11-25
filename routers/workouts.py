from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import database, schemas, models
import json

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

@router.put("/{workout_id}")
def update_workout(workout_id: int, workout: schemas.WorkoutCreate, db: Session = Depends(get_db)):
    db_log = db.query(models.Workout).filter(models.Workout.id == workout_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Workout not found")

    if db_log.user_id != workout.user_id:
        raise HTTPException(status_code=400, detail="Cannot change user_id of a workout")

    db_log.date = workout.date
    db_log.name = workout.name
    db_log.exercises_json = workout.exercises_json
    db_log.duration = workout.duration

    db.commit()
    db.refresh(db_log)
    return db_log


@router.delete("/{workout_id}")
def delete_workout(workout_id: int, db: Session = Depends(get_db)):
    db_log = db.query(models.Workout).filter(models.Workout.id == workout_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Workout not found")

    db.delete(db_log)
    db.commit()
    return {"status": "deleted"}



