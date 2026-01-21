from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from groq import Groq
from app.core.config import settings
from app.dependencies import get_authenticated_db

router = APIRouter()

# Initialize client only if key exists
client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None

class AIRequest(BaseModel):
    command: str

def ask_nexus_ai(prompt: str, context: dict) -> str:
    if not client: 
        return "AI Module Error: GROQ_API_KEY is not configured in the server environment."
    
    system_prompt = f"""
    You are NEXUS, the sentient core of this Operating System.
    [USER CONTEXT DATA]:
    - Tasks: {context.get('tasks', 'None')}
    - Recent Journal: {context.get('journal', 'None')}
    - Files: {context.get('files', 'None')}
    - System ID: {context.get('user_id', 'Unknown')}

    PROTOCOLS:
    1. Acknowledge user data if relevant to the query.
    2. Be concise, professional, and slightly futuristic.
    3. If the user asks to 'do' something, explain how you've updated their system view.
    """
    
    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            max_tokens=300,
            temperature=0.7
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Neural processing error: {str(e)}"

@router.post("/command")
def process_command(req: AIRequest, db = Depends(get_authenticated_db)):
    # Gather multi-module context for the AI
    try:
        tasks = db.table("tasks").select("title, status").limit(5).execute().data
        journal = db.table("journal_entries").select("content").limit(3).execute().data
        files = db.table("files").select("name").limit(5).execute().data
        
        context = {
            "user_id": db.user_id,
            "tasks": tasks,
            "journal": journal,
            "files": files
        }
        
        response = ask_nexus_ai(req.command, context)
        return {"response": response}
    except Exception as e:
        return {"response": f"Context gathering failure: {str(e)}"}

@router.get("/briefing")
def get_briefing(db = Depends(get_authenticated_db)):
    tasks = db.table("tasks").select("title").eq("status", "todo").execute().data
    context = {"tasks": tasks, "user_id": db.user_id}
    msg = ask_nexus_ai("Generate a quick morning system briefing based on my pending tasks.", context)
    return {"message": msg}