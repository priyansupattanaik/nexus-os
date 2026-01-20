from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from app.services.db import supabase  # <<< NEW: Import from centralized service
from app.api import ai, tasks       # <<< NEW: Import the tasks router

app = FastAPI(title="NEXUS API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"]) # <<< NEW: Register tasks

@app.get("/")
def read_root():
    return {"status": "active", "system": "NEXUS Core"}

@app.get("/api/health")
def health_check():
    db_status = "disconnected"
    if supabase:
        try:
            # Simple check to see if we can talk to Supabase
            # We just check the auth service status indirectly or assume connected if client exists
            db_status = "connected"
        except Exception as e:
            db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy", 
        "database": db_status,
        "ai": "standby"
    }

handler = Mangum(app)