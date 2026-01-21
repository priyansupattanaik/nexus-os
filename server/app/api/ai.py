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
    command: str

def ask_nexus_ai(prompt: str, context: dict) -> str:
    if not client: return "AI Offline: Check API Key."
    
    system = f"""
    You are NEXUS OS. 
    [CONTEXT]: {str(context)}
    Be concise, helpful, and act as the OS interface.
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
def process_command(req: AIRequest, db = Depends(get_authenticated_db)):
    # Gather Context
    tasks = db.table("tasks").select("title, status").limit(5).execute().data
    files = db.table("files").select("name").limit(5).execute().data
    
    context = {
        "user_id": db.user_id,
        "recent_tasks": tasks,
        "files": files
    }
    
    return {"response": ask_nexus_ai(req.command, context)}

@router.get("/briefing")
def get_briefing(db = Depends(get_authenticated_db)):
    tasks = db.table("tasks").select("title").limit(5).execute().data
    return {"message": ask_nexus_ai("Give me a short status briefing.", {"tasks": tasks})}