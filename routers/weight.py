# weight.py
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

@router.put("/{log_id}")
def update_weight(log_id: int, log: schemas.WeightCreate, db: Session = Depends(get_db)):
    """
    Full update of an existing weight log.
    """
    db_log = db.query(models.WeightLog).filter(models.WeightLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Weight log not found")

    if db_log.user_id != log.user_id:
        raise HTTPException(status_code=400, detail="Cannot change user_id of a log")

    db_log.date = log.date
    db_log.weight = log.weight
    # db_log.delta will be handled when we implement recompute.

    db.commit()
    db.refresh(db_log)
    return db_log


@router.delete("/{log_id}")
def delete_weight(log_id: int, db: Session = Depends(get_db)):
    db_log = db.query(models.WeightLog).filter(models.WeightLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Weight log not found")

    db.delete(db_log)
    db.commit()
    return {"status": "deleted"}
