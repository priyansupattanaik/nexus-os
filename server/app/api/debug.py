from fastapi import APIRouter, Depends
from app.dependencies import get_authenticated_db
from app.api.ai import ask_nexus_ai

router = APIRouter()

@router.get("/run_diagnostics")
def run_diagnostics(db = Depends(get_authenticated_db)):
    report = {"status": "scanning", "checks": {}}
    
    # 1. DB Check
    try:
        db.table("tasks").select("id", count="exact").limit(1).execute()
        report["checks"]["database"] = "PASS"
    except Exception as e:
        report["checks"]["database"] = f"FAIL: {str(e)}"

    # 2. Auth Check
    try:
        user = db.auth.get_user()
        report["checks"]["auth"] = "PASS"
    except:
        report["checks"]["auth"] = "FAIL"

    # 3. AI Analysis
    analysis = ask_nexus_ai(f"Analyze diagnostic report: {str(report)}", {})
    
    return {"technical_report": report, "ai_analysis": analysis}