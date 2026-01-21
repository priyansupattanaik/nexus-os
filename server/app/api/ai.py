from fastapi import APIRouter, Depends
from pydantic import BaseModel
from groq import Groq
from app.core.config import settings
from app.dependencies import get_authenticated_db

router = APIRouter()

try:
    client = Groq(api_key=settings.GROQ_API_KEY)
except:
    client = None

class AIRequest(BaseModel):
    prompt: str
    context_type: str = "general"

def ask_nexus_ai(prompt: str, context: dict) -> str:
    if not client: return "AI Core Offline: Missing API Key"
    
    system = f"""
    You are NEXUS OS. 
    [SYSTEM CONTEXT]: {str(context)}
    Respond as a high-tech operating system interface.
    """
    try:
        completion = client.chat.completions.create(
            messages=[{"role": "system", "content": system}, {"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            max_tokens=250
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"AI Error: {str(e)}"

@router.post("/command")
def process_voice_command(req: dict, db = Depends(get_authenticated_db)):
    # Simple context gathering
    context = {"status": "User is active"}
    return {"response": ask_nexus_ai(req.get("command", ""), context)}

@router.get("/briefing")
def get_briefing(db = Depends(get_authenticated_db)):
    # Gather minimal context for briefing
    tasks = db.table("tasks").select("title").limit(5).execute().data
    context = {"pending_tasks": tasks}
    return {"message": ask_nexus_ai("Give me a system briefing.", context)}