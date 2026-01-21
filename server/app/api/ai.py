from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from groq import Groq
from app.core.config import settings
from app.dependencies import get_authenticated_db

router = APIRouter()

# GROQ Client Init
try:
    client = Groq(api_key=settings.GROQ_API_KEY)
except:
    client = None

class AIRequest(BaseModel):
    command: str

def ask_nexus_ai(prompt: str, context_str: str) -> str:
    if not client: return "AI Core is Offline: GROQ_API_KEY missing in server env."
    
    system_prompt = f"""
    You are NEXUS, the OS intelligence.
    [USER CONTEXT]: {context_str}
    
    Guidelines:
    1. Be concise and professional.
    2. Reference the user's tasks or files if relevant.
    3. You are part of the UI, not an outside chatbot.
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
        return f"Neural link failed: {str(e)}"

@router.post("/command")
def process_command(req: AIRequest, db = Depends(get_authenticated_db)):
    # Pull fresh context from rebuilt tables
    tasks = db.table("tasks").select("title").limit(5).execute().data
    files = db.table("files").select("name").limit(3).execute().data
    
    context = f"UID: {db.user_id}, Tasks: {tasks}, Files: {files}"
    
    response = ask_nexus_ai(req.command, context)
    return {"response": response}

@router.get("/briefing")
def get_briefing(db = Depends(get_authenticated_db)):
    tasks = db.table("tasks").select("title").eq("status", "todo").execute().data
    msg = ask_nexus_ai("Give me a system briefing based on these tasks.", str(tasks))
    return {"message": msg}