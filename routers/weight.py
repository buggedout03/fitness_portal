# weight.py
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
def add_weight(log: schemas.WeightCreate, db: Session = Depends(get_db)):
    # Just store raw log; no delta field anymore
    db_log = models.WeightLog(
        user_id=log.user_id,
        date=log.date,
        weight=log.weight,
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    # optional: return shape with delta=None for compatibility
    return {
        "id": db_log.id,
        "user_id": db_log.user_id,
        "date": db_log.date,
        "weight": db_log.weight,
        "delta": None,
    }


@router.get("/list")
def list_weights(user_id: int, db: Session = Depends(get_db)):
    rows = (
        db.query(models.WeightLog)
        .filter(models.WeightLog.user_id == user_id)
        .order_by(models.WeightLog.date.asc(), models.WeightLog.id.asc())
        .all()
    )

    out = []
    prev = None
    for r in rows:
        d = None if prev is None else r.weight - prev.weight
        out.append({
            "id": r.id,
            "user_id": r.user_id,
            "date": r.date,
            "weight": r.weight,
            "delta": d,  # computed on the fly
        })
        prev = r

    return out
