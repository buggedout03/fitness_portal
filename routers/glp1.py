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
def add_glp1_entry(entry: schemas.GLP1Create, db: Session = Depends(get_db)):
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
        .order_by(models.GLP1.date.desc())
        .all()
    )
