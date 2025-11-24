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
def add_measurements(log: schemas.MeasurementCreate, db: Session = Depends(get_db)):
    last_log = (
        db.query(models.MeasurementLog)
        .filter(models.MeasurementLog.user_id == log.user_id)
        .order_by(models.MeasurementLog.date.desc(), models.MeasurementLog.id.desc())
        .first()
    )

    delta_waist = delta_hips = delta_neck = None

    if last_log:
        delta_waist = log.waist_cm - last_log.waist_cm
        delta_hips = log.hips_cm - last_log.hips_cm
        delta_neck = log.neck_cm - last_log.neck_cm

    db_log = models.MeasurementLog(
        user_id=log.user_id,
        date=log.date.isoformat(),   
        waist_cm=log.waist_cm,
        hips_cm=log.hips_cm,
        neck_cm=log.neck_cm,
        shoulder_cm=log.shoulder_cm,
        chest_cm=log.chest_cm,
        delta_waist=delta_waist,
        delta_hips=delta_hips,
        delta_neck=delta_neck,
    )

    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/list")
def list_measurements(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.MeasurementLog)
        .filter(models.MeasurementLog.user_id == user_id)
        .order_by(models.MeasurementLog.date.asc(), models.MeasurementLog.id.asc())
        .all()
    )
