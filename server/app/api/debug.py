from fastapi import APIRouter, Depends
from app.dependencies import get_authenticated_db
from app.api.ai import ask_nexus_ai

router = APIRouter()

@router.get("/run_diagnostics")
def run_diagnostics(db = Depends(get_authenticated_db)):
    report = {"checks": {}}
    
    # 1. Database Connection Check
    try:
        db.table("tasks").select("id").limit(1).execute()
        report["checks"]["Database"] = "PASS"
    except Exception as e:
        report["checks"]["Database"] = f"FAIL: {str(e)}"

    # 2. Authentication Context Check
    if db.user_id:
        report["checks"]["Auth"] = f"PASS (UID: {db.user_id[:8]})"
    else:
        report["checks"]["Auth"] = "FAIL"

    # 3. AI Direct-Link Check
    analysis = ask_nexus_ai(f"System Health Check: {str(report)}", {})
    
    return {"technical_report": report, "ai_analysis": analysis}