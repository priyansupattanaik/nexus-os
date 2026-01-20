from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from supabase import create_client, Client
from app.core.config import settings
from app.api import ai  # <<< Import the new AI router

app = FastAPI(title="NEXUS API")

# Initialize Supabase Client
try:
    supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
except Exception as e:
    print(f"Warning: Supabase client failed to initialize. {e}")
    supabase = None

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

@app.get("/")
def read_root():
    return {"status": "active", "system": "NEXUS Core"}

@app.get("/api/health")
def health_check():
    db_status = "disconnected"
    if supabase:
        try:
            response = supabase.table("profiles").select("count", count="exact").execute()
            db_status = "connected"
        except Exception as e:
            db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy", 
        "database": db_status,
        "ai": "standby"
    }

handler = Mangum(app)