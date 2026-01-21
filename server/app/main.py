from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import tasks, journal, finance, habits, profile, ai, explorer, settings, debug

app = FastAPI(title="Nexus OS Kernel")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CORE ROUTERS ---
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(journal.router, prefix="/api/journal", tags=["Journal"])
app.include_router(finance.router, prefix="/api/finance", tags=["Finance"])
app.include_router(habits.router, prefix="/api/habits", tags=["Habits"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])

# --- INTELLIGENCE ROUTERS ---
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(debug.router, prefix="/api/debug", tags=["Debug"])

# --- OS ROUTERS ---
app.include_router(explorer.router, prefix="/api/explorer", tags=["Explorer"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])

@app.get("/")
def system_status():
    return {"status": "ONLINE", "version": "NEXUS-v2.4.0"}