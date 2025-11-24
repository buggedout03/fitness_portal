from fastapi import FastAPI
from database import Base, engine
from routers import users, weight, measurements, workouts, prs, glp1, analytics
from fastapi.staticfiles import StaticFiles

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(weight.router, prefix="/weight", tags=["Weight"])
app.include_router(measurements.router, prefix="/measurements", tags=["Measurements"])
app.include_router(workouts.router, prefix="/workouts", tags=["Workouts"])
app.include_router(prs.router, prefix="/prs", tags=["PRs"])
app.include_router(glp1.router, prefix="/glp1", tags=["GLP1"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

app.mount("/", StaticFiles(directory="static", html=True), name="static")

#stable v1