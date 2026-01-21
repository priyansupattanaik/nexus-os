from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from groq import Groq
from app.core.config import settings
from app.dependencies import get_authenticated_db

router = APIRouter()

# Initialize Groq only if key is present
client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None

class AIRequest(BaseModel):
    command: str

def ask_nexus_ai(prompt: str, context: dict) -> str:
    if not client: 
        return "Nexus AI Error: The GROQ_API_KEY environment variable is missing on the server."
    
    system_prompt = f"""
    You are NEXUS, the system intelligence.
    [SYSTEM CONTEXT]:
    - User ID: {context.get('user_id', 'Unknown')}
    - Active Tasks: {context.get('tasks', 'No data')}
    - Storage: {context.get('files', 'No data')}
    
    Respond clearly and professionally as a sentient OS.
    """
    
    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            max_tokens=300
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Neural Error: {str(e)}"

@router.post("/command")
def process_command(req: AIRequest, db = Depends(get_authenticated_db)):
    try:
        # Pull live context so the AI knows what is in the DB
        tasks = db.table("tasks").select("title, status").limit(5).execute().data
        files = db.table("files").select("name").limit(5).execute().data
        
        context = {
            "user_id": db.user_id,
            "tasks": tasks,
            "files": files
        }
        
        response = ask_nexus_ai(req.command, context)
        return {"response": response}
    except Exception as e:
        return {"response": f"Context uplink failed: {str(e)}"}

@router.get("/briefing")
def get_briefing(db = Depends(get_authenticated_db)):
    tasks = db.table("tasks").select("title").eq("status", "todo").execute().data
    return {"message": ask_nexus_ai("Provide a concise system status and task briefing.", {"tasks": tasks})}