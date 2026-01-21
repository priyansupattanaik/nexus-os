from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import tasks, journal, finance, habits, profile, ai, explorer, settings, debug

app = FastAPI(title="NEXUS OS Core")

# Secure CORS Policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Route Mapping
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(journal.router, prefix="/api/journal", tags=["Journal"])
app.include_router(finance.router, prefix="/api/finance", tags=["Finance"])
app.include_router(habits.router, prefix="/api/habits", tags=["Habits"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(explorer.router, prefix="/api/explorer", tags=["Explorer"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])
app.include_router(debug.router, prefix="/api/debug", tags=["Debug"])

@app.get("/")
def health_check():
    return {"status": "ONLINE", "kernel": "v3.1.0"}