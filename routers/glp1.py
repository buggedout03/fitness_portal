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
