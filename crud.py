from sqlalchemy.orm import Session
import models, schemas

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def add_weight(db: Session, log: schemas.WeightCreate):
    data = log.dict()
    # Ensure date is stored as ISO string
    data["date"] = log.date.isoformat()

    db_log = models.WeightLog(**data)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log
