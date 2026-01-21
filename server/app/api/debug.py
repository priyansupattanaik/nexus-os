from fastapi import APIRouter, Depends
from app.dependencies import get_authenticated_db
from app.api.ai import ask_nexus_ai

router = APIRouter()

@router.get("/run_diagnostics")
def run_diagnostics(db = Depends(get_authenticated_db)):
    report = {"status": "scanning", "checks": {}}
    
    # 1. DB Read Check
    try:
        db.table("tasks").select("id", count="exact").limit(1).execute()
        report["checks"]["database"] = "PASS"
    except Exception as e:
        report["checks"]["database"] = f"FAIL: {str(e)}"

    # 2. Auth Context Check
    if db.user_id:
        report["checks"]["auth"] = f"PASS (User: {db.user_id[:8]}...)"
    else:
        report["checks"]["auth"] = "FAIL"

    # 3. AI Connectivity
    analysis = ask_nexus_ai(f"Analyze this system report: {str(report)}", {})
    
    return {"technical_report": report, "ai_analysis": analysis}