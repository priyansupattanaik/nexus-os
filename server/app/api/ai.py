from fastapi import APIRouter, Depends
from pydantic import BaseModel
from groq import Groq
from app.core.config import settings
from app.dependencies import get_authenticated_db

router = APIRouter()
client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None

class AIRequest(BaseModel):
    command: str

def ask_nexus_ai(prompt: str, context: dict) -> str:
    if not client: return "AI Uplink Offline. Configure GROQ_API_KEY on the server."
    
    system = f"You are NEXUS OS. [USER DATA]: {str(context)}. Be technical and concise."
    
    try:
        chat = client.chat.completions.create(
            messages=[{"role": "system", "content": system}, {"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            max_tokens=250
        )
        return chat.choices[0].message.content
    except Exception as e:
        return f"Neural Error: {str(e)}"

@router.post("/command")
def process_command(req: AIRequest, db = Depends(get_authenticated_db)):
    tasks = db.table("tasks").select("title").limit(5).execute().data
    context = {"uid": db.user_id, "tasks": tasks}
    return {"response": ask_nexus_ai(req.command, context)}

@router.get("/briefing")
def get_briefing(db = Depends(get_authenticated_db)):
    tasks = db.table("tasks").select("title").eq("status", "todo").execute().data
    return {"message": ask_nexus_ai("Give me a system briefing.", str(tasks))}