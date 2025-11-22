from sqlalchemy.orm import Session
import models, schemas

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def add_weight(db: Session, log: schemas.WeightCreate):
    db_log = models.WeightLog(**log.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log
