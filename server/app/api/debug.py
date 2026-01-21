from fastapi import APIRouter, Depends
from app.dependencies import get_authenticated_db
from app.services.db import supabase_admin
from app.api.ai import ask_nexus_ai

router = APIRouter()

@router.get("/run_diagnostics")
def run_diagnostics(db = Depends(get_authenticated_db)):
    report = {"status": "running", "checks": {}}
    
    # 1. Check Database Connection (User Level)
    try:
        user_check = db.auth.get_user()
        report["checks"]["auth"] = "PASS"
        report["user_id"] = user_check.user.id
    except Exception as e:
        report["checks"]["auth"] = f"FAIL: {str(e)}"

    # 2. Check Data Persistence (Write Test)
    try:
        # Try fetching tasks count
        tasks = db.table("tasks").select("id", count="exact").execute()
        report["checks"]["database_read"] = f"PASS ({tasks.count} tasks found)"
    except Exception as e:
        report["checks"]["database_read"] = f"FAIL: {str(e)}"

    # 3. Check AI Latency
    try:
        ai_response = ask_nexus_ai("Ping.", context={})
        report["checks"]["ai_core"] = "PASS" if ai_response else "FAIL"
    except Exception as e:
        report["checks"]["ai_core"] = f"FAIL: {str(e)}"

    # 4. AI Analysis of the Report
    final_analysis = ask_nexus_ai(
        f"Analyze this diagnostic report and tell the user if their system is healthy: {str(report)}",
        context={}
    )
    
    return {
        "technical_report": report,
        "ai_analysis": final_analysis
    }