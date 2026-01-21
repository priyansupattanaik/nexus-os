from fastapi import APIRouter, Depends
from pydantic import BaseModel
from groq import Groq
from app.core.config import settings
from app.dependencies import get_authenticated_db

router = APIRouter()

# GROQ Core
client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None

class AIRequest(BaseModel):
    command: str

def ask_nexus_ai(prompt: str, context: dict) -> str:
    if not client: return "AI Core Offline: GROQ_API_KEY is missing from environment variables."
    
    system_prompt = f"""
    You are NEXUS, the AI heart of this OS.
    USER_ID: {context.get('uid')}
    TASKS: {context.get('tasks')}
    FILES: {context.get('files')}

    PROTOCOLS:
    1. Acknowledge user data if relevant.
    2. Be concise and act as an interface.
    """
    
    try:
        chat = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            max_tokens=250
        )
        return chat.choices[0].message.content
    except Exception as e:
        return f"Neural Error: {str(e)}"

@router.post("/command")
def process_command(req: AIRequest, db = Depends(get_authenticated_db)):
    # Pull context from newly verified connection
    tasks = db.table("tasks").select("title").limit(5).execute().data
    files = db.table("files").select("name").limit(3).execute().data
    
    context = {"uid": db.user_id, "tasks": tasks, "files": files}
    response = ask_nexus_ai(req.command, context)
    return {"response": response}

@router.get("/briefing")
def get_briefing(db = Depends(get_authenticated_db)):
    tasks = db.table("tasks").select("title").eq("status", "todo").execute().data
    msg = ask_nexus_ai("Generate a short OS status report.", {"tasks": tasks})
    return {"message": msg}