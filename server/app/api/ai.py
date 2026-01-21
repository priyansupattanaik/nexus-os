from fastapi import APIRouter, HTTPException, Depends
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
    context_type: str = "general" # 'tasks', 'journal', 'general'

def ask_nexus_ai(prompt: str, context: dict) -> str:
    """Internal helper to query the AI Model"""
    if not client: return "AI Module Offline: API Key Missing."
    
    system_prompt = f"""
    You are NEXUS, the operating system AI.
    [CURRENT CONTEXT]
    {str(context)}
    
    Analyze the user's request based on this data. Be concise, technical, and helpful.
    """
    
    try:
        chat = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            max_tokens=200
        )
        return chat.choices[0].message.content
    except Exception as e:
        return f"Neural Link Error: {str(e)}"

@router.post("/query")
def query_ai(req: AIRequest, db = Depends(get_authenticated_db)):
    # 1. Gather Dynamic Context based on request type
    context_data = {}
    
    if req.context_type == 'tasks':
        tasks = db.table("tasks").select("*").limit(10).execute()
        context_data["tasks"] = tasks.data
    elif req.context_type == 'journal':
        entries = db.table("journal_entries").select("*").limit(5).execute()
        context_data["journal_history"] = entries.data
    elif req.context_type == 'files':
        files = db.table("files").select("name, content").limit(5).execute()
        context_data["user_files"] = files.data
        
    # 2. Get Response
    response = ask_nexus_ai(req.prompt, context_data)
    return {"response": response}