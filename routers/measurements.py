# measurements.py
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
def add_measurements(log: schemas.MeasurementCreate, db: Session = Depends(get_db)):
    db_log = models.MeasurementLog(
        user_id=log.user_id,
        date=log.date,
        waist_cm=log.waist_cm,
        hips_cm=log.hips_cm,
        neck_cm=log.neck_cm,
        shoulder_cm=log.shoulder_cm,
        chest_cm=log.chest_cm,
    )

    db.add(db_log)
    db.commit()
    db.refresh(db_log)

    # For consistency, return deltas as None on the single insert
    return {
        "id": db_log.id,
        "user_id": db_log.user_id,
        "date": db_log.date,
        "waist_cm": db_log.waist_cm,
        "hips_cm": db_log.hips_cm,
        "neck_cm": db_log.neck_cm,
        "shoulder_cm": db_log.shoulder_cm,
        "chest_cm": db_log.chest_cm,
        "delta_waist": None,
        "delta_hips": None,
        "delta_neck": None,
    }


@router.get("/list")
def list_measurements(user_id: int, db: Session = Depends(get_db)):
    rows = (
        db.query(models.MeasurementLog)
        .filter(models.MeasurementLog.user_id == user_id)
        .order_by(models.MeasurementLog.date.asc(), models.MeasurementLog.id.asc())
        .all()
    )

    out = []
    prev = None
    for r in rows:
        out.append({
            "id": r.id,
            "user_id": r.user_id,
            "date": r.date,
            "waist_cm": r.waist_cm,
            "hips_cm": r.hips_cm,
            "neck_cm": r.neck_cm,
            "shoulder_cm": r.shoulder_cm,
            "chest_cm": r.chest_cm,
            "delta_waist": None if prev is None else r.waist_cm - prev.waist_cm,
            "delta_hips": None if prev is None else r.hips_cm - prev.hips_cm,
            "delta_neck": None if prev is None else r.neck_cm - prev.neck_cm,
        })
        prev = r

    return out

@router.put("/{log_id}")
def update_measurements(log_id: int, log: schemas.MeasurementCreate, db: Session = Depends(get_db)):
    """
    Full update of an existing measurement log.
    NOTE: delta_* not recalculated yet – Phase 3 will fix deltas globally.
    """
    db_log = db.query(models.MeasurementLog).filter(models.MeasurementLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Measurement log not found")

    if db_log.user_id != log.user_id:
        raise HTTPException(status_code=400, detail="Cannot change user_id of a log")

    db_log.date = log.date
    db_log.waist_cm = log.waist_cm
    db_log.hips_cm = log.hips_cm
    db_log.neck_cm = log.neck_cm
    db_log.shoulder_cm = log.shoulder_cm
    db_log.chest_cm = log.chest_cm
<<<<<<< HEAD
    # delta_waist / delta_hips / delta_neck left as-is for now
=======
>>>>>>> cleanup

    db.commit()
    db.refresh(db_log)
    return db_log


@router.delete("/{log_id}")
def delete_measurements(log_id: int, db: Session = Depends(get_db)):
    db_log = db.query(models.MeasurementLog).filter(models.MeasurementLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Measurement log not found")

    db.delete(db_log)
    db.commit()
    return {"status": "deleted"}
