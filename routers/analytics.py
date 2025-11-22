from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
import database, models
from utils.calculations import (
    rolling_average, linear_regression,
    navy_body_fat, bmi, tdee,
    glp1_daily_concentrations
)

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --------------------------
# 1. Weight Trend Endpoint
# --------------------------

@router.get("/weight/trends")
def weight_trends(user_id: int, db: Session = Depends(get_db)):
    rows = (
        db.query(models.WeightLog)
        .filter(models.WeightLog.user_id == user_id)
        .order_by(models.WeightLog.date.asc())
        .all()
    )

    data = [(r.date, r.weight) for r in rows]

    return {
        "rolling_7": rolling_average(data, 7),
        "rolling_30": rolling_average(data, 30),
        "rolling_90": rolling_average(data, 90),
        "rolling_180": rolling_average(data, 180),
        "rolling_365": rolling_average(data, 365),
        "regression": linear_regression(data),
        "raw": data
    }


# --------------------------
# 2. Measurement Trends
# --------------------------

@router.get("/measurements/trends")
def measurement_trends(user_id: int, db: Session = Depends(get_db)):
    rows = (
        db.query(models.MeasurementLog)
        .filter(models.MeasurementLog.user_id == user_id)
        .order_by(models.MeasurementLog.date.asc())
        .all()
    )

    waist = [(r.date, r.waist_cm) for r in rows]
    hips = [(r.date, r.hips_cm) for r in rows]
    neck = [(r.date, r.neck_cm) for r in rows]

    return {
        "waist": {
            "rolling_30": rolling_average(waist, 30),
            "regression": linear_regression(waist),
            "raw": waist
        },
        "hips": {
            "rolling_30": rolling_average(hips, 30),
            "regression": linear_regression(hips),
            "raw": hips
        },
        "neck": {
            "rolling_30": rolling_average(neck, 30),
            "regression": linear_regression(neck),
            "raw": neck
        }
    }


# --------------------------
# 3. Body Fat, BMI, TDEE
# --------------------------

@router.get("/body/summary")
def body_summary(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    latest = (
        db.query(models.MeasurementLog)
        .filter(models.MeasurementLog.user_id == user_id)
        .order_by(models.MeasurementLog.date.desc())
        .first()
    )
    latest_weight = (
        db.query(models.WeightLog)
        .filter(models.WeightLog.user_id == user_id)
        .order_by(models.WeightLog.date.desc())
        .first()
    )

    if not (user and latest and latest_weight):
        return {"error": "missing data"}

    bf = navy_body_fat(
        height_cm=user.height_cm,
        waist_cm=latest.waist_cm,
        neck_cm=latest.neck_cm,
        hips_cm=latest.hips_cm,
        gender=user.gender
    )

    return {
        "body_fat_percent": bf,
        "bmi": bmi(latest_weight.weight, user.height_cm),
        "tdee": tdee(latest_weight.weight, user.height_cm, user.age, user.gender),
    }


# --------------------------
# 4. GLP-1 decay curve
# --------------------------

@router.get("/glp1/decay")
def glp1_decay(user_id: int, db: Session = Depends(get_db)):
    entry = (
        db.query(models.GLP1)
        .filter(models.GLP1.user_id == user_id)
        .order_by(models.GLP1.date.desc())
        .first()
    )

    if not entry:
        return {"error": "no GLP1 dose logged"}

    curve = glp1_daily_concentrations(
        dose_mg=entry.dose_mg,
        half_life_days=entry.half_life_days,
        start_date=entry.date,
        days=7,
    )

    return {
        "latest_dose": entry.dose_mg,
        "half_life": entry.half_life_days,
        "curve": curve
    }
