from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import database, crud, schemas, models

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/add")
def add_weight(log: schemas.WeightCreate, db: Session = Depends(get_db)):
    # Get latest existing entry to calculate delta
    last_log = (
        db.query(models.WeightLog)
        .filter(models.WeightLog.user_id == log.user_id)
        .order_by(models.WeightLog.date.desc(), models.WeightLog.id.desc())
        .first()
    )

    delta = None
    if last_log:
        delta = log.weight - last_log.weight

    db_log = models.WeightLog(
        user_id=log.user_id,
        date=log.date.isoformat(),  
        weight=log.weight,
        delta=delta,
    )

    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/list")
def list_weights(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.WeightLog)
        .filter(models.WeightLog.user_id == user_id)
        .order_by(models.WeightLog.date.asc(), models.WeightLog.id.asc())
        .all()
    )
