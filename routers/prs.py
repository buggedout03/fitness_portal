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
def add_pr(pr: schemas.PRCreate, db: Session = Depends(get_db)):
    db_record = models.PR(
        user_id=pr.user_id,
        exercise_name=pr.exercise_name,
        weight=pr.weight,
        reps=pr.reps,
        date=pr.date,
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.get("/list")
def list_prs(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.PR)
        .filter(models.PR.user_id == user_id)
        .order_by(models.PR.date.desc(), models.PR.id.desc())
        .all()
    )

@router.put("/{pr_id}")
def update_pr(pr_id: int, pr: schemas.PRCreate, db: Session = Depends(get_db)):
    db_record = db.query(models.PR).filter(models.PR.id == pr_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="PR record not found")

    if db_record.user_id != pr.user_id:
        raise HTTPException(status_code=400, detail="Cannot change user_id of a PR")

    db_record.exercise_name = pr.exercise_name
    db_record.weight = pr.weight
    db_record.reps = pr.reps
    db_record.date = pr.date

    db.commit()
    db.refresh(db_record)
    return db_record


@router.delete("/{pr_id}")
def delete_pr(pr_id: int, db: Session = Depends(get_db)):
    db_record = db.query(models.PR).filter(models.PR.id == pr_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="PR record not found")

    db.delete(db_record)
    db.commit()
    return {"status": "deleted"}

