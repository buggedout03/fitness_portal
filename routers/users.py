from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import database, crud, schemas, models  # <-- import models directly

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/add")
def add_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user)

@router.get("/list")
def list_users(db: Session = Depends(get_db)):
    # Clean, direct query on the User model
    return db.query(models.User).order_by(models.User.id.asc()).all()

@router.put("/{user_id}")
def update_user(user_id: int, user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Full update of a user.
    """
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_user.name = user.name
    db_user.age = user.age
    db_user.height_cm = user.height_cm
    db_user.gender = user.gender

    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Delete a user.
    """
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check for existing data
    has_weight = db.query(models.WeightLog).filter(models.WeightLog.user_id == user_id).first()
    has_meas = db.query(models.MeasurementLog).filter(models.MeasurementLog.user_id == user_id).first()
    has_workouts = db.query(models.Workout).filter(models.Workout.user_id == user_id).first()
    has_prs = db.query(models.PR).filter(models.PR.user_id == user_id).first()
    has_glp1 = db.query(models.GLP1).filter(models.GLP1.user_id == user_id).first()

    if any([has_weight, has_meas, has_workouts, has_prs, has_glp1]):
        raise HTTPException(
            status_code=400,
            detail="User has existing logs; delete logs first or implement cascading deletes.",
        )

    db.delete(db_user)
    db.commit()
    return {"status": "deleted"}

