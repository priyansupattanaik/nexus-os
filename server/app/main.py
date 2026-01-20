from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from app.services.db import supabase
from app.api import ai, tasks, habits, finance  # <<< Import new modules

app = FastAPI(title="NEXUS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(habits.router, prefix="/api/habits", tags=["Habits"])   # <<< NEW
app.include_router(finance.router, prefix="/api/finance", tags=["Finance"]) # <<< NEW

@app.get("/")
def read_root():
    return {"status": "active", "system": "NEXUS Core"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

handler = Mangum(app)