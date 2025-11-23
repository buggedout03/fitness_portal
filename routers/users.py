from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import database, crud, schemas, models  # <-- import models directly

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/add")
def add_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user)

@router.get("/list")
def list_users(db: Session = Depends(get_db)):
    # Clean, direct query on the User model
    return db.query(models.User).order_by(models.User.id.asc()).all()
