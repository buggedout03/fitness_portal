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
def add_glp1_entry(entry: schemas.GLP1Create, db: Session = Depends(get_db)):
    # extra safety (Pydantic already enforces > 0, but this gives nicer messages if you tweak ranges later)
    if entry.dose_mg <= 0:
        raise HTTPException(status_code=400, detail="dose_mg must be > 0")
    if entry.half_life_days <= 0:
        raise HTTPException(status_code=400, detail="half_life_days must be > 0")

    db_entry = models.GLP1(**entry.dict())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


@router.get("/list")
def list_glp1(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.GLP1)
        .filter(models.GLP1.user_id == user_id)
        .order_by(models.GLP1.date.desc(), models.GLP1.id.desc())
        .all()
    )

@router.put("/{entry_id}")
def update_glp1_entry(entry_id: int, entry: schemas.GLP1Create, db: Session = Depends(get_db)):
    db_entry = db.query(models.GLP1).filter(models.GLP1.id == entry_id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="GLP1 entry not found")

    if db_entry.user_id != entry.user_id:
        raise HTTPException(status_code=400, detail="Cannot change user_id of a GLP1 entry")

    db_entry.date = entry.date
    db_entry.dose_mg = entry.dose_mg
    db_entry.half_life_days = entry.half_life_days
    db_entry.concentration = entry.concentration

    db.commit()
    db.refresh(db_entry)
    return db_entry


@router.delete("/{entry_id}")
def delete_glp1_entry(entry_id: int, db: Session = Depends(get_db)):
    db_entry = db.query(models.GLP1).filter(models.GLP1.id == entry_id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="GLP1 entry not found")

    db.delete(db_entry)
    db.commit()
    return {"status": "deleted"}
