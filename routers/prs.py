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
def add_pr(pr: schemas.PRCreate, db: Session = Depends(get_db)):
    db_record = models.PR(**pr.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.get("/list")
def list_prs(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.PR)
        .filter(models.PR.user_id == user_id)
        .order_by(models.PR.date.desc())
        .all()
    )
