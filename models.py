from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    age = Column(Integer)
    height_cm = Column(Integer)
    gender = Column(String)

class WeightLog(Base):
    __tablename__ = "weight_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(String)
    weight = Column(Float)
    delta = Column(Float)

class MeasurementLog(Base):
    __tablename__ = "measurement_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignForeignKey("users.id"))
    date = Column(String)
    waist_cm = Column(Float)
    hips_cm = Column(Float)
    neck_cm = Column(Float)
    shoulder_cm = Column(Float)
    chest_cm = Column(Float)
    delta_waist = Column(Float)
    delta_hips = Column(Float)
    delta_neck = Column(Float)

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(String)
    name = Column(String)
    exercises_json = Column(Text)
    duration = Column(Integer)

class PR(Base):
    __tablename__ = "prs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exercise_name = Column(String)
    weight = Column(Float)
    reps = Column(Integer)
    date = Column(String)

class GLP1(Base):
    __tablename__ = "glp1_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    dose_mg = Column(Float)
    date = Column(String)
    half_life_days = Column(Float)
    concentration = Column(Float)
