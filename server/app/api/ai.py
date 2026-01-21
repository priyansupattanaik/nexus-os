from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from groq import Groq
from app.core.config import settings
from app.services.db import supabase

router = APIRouter()

try:
    client = Groq(api_key=settings.GROQ_API_KEY)
except Exception as e:
    client = None
    print(f"AI Warning: {e}")

class CommandRequest(BaseModel):
    command: str

def get_user_context(token: str):
    """Fetches user's live data INCLUDING FILES for full OS awareness."""
    try:
        supabase.postgrest.auth(token)
        
        # 1. Fetch Tasks
        tasks = supabase.table("tasks").select("title, status").limit(10).execute()
        task_list = [f"{t['title']} ({t['status']})" for t in tasks.data]
        
        # 2. Fetch Finance
        txns = supabase.table("transactions").select("description, amount, type").order("created_at", desc=True).limit(5).execute()
        finance_list = [f"{t['description']} ({'+' if t['type']=='income' else '-'}${t['amount']})" for t in txns.data]
        
        # 3. Fetch Files (The "Long Term Memory")
        files = supabase.table("files").select("name, content").eq("type", "file").limit(5).execute()
        file_list = [f"FILE '{f['name']}': {f['content'][:100]}..." for f in files.data]

        return {
            "tasks": task_list,
            "finance": finance_list,
            "files": file_list
        }
    except Exception as e:
        print(f"Context Error: {e}")
        return None

def build_system_prompt(context: dict):
    return f"""
    You are NEXUS, an advanced AI OS.
    
    [SYSTEM DATA]
    TASKS: {"; ".join(context['tasks']) if context['tasks'] else "None"}
    FINANCE: {"; ".join(context['finance']) if context['finance'] else "No recent data"}
    USER FILES: {"; ".join(context['files']) if context['files'] else "No files found"}

    [PROTOCOLS]
    1. You have access to the user's file system. If they ask about notes, check 'USER FILES'.
    2. Be concise, professional, and intelligent.
    3. Respond as if you are the operating system interface itself.
    """

@router.get("/briefing")
def get_briefing(authorization: str = Header(None)):
    if not client: return {"message": "AI Module Offline."}
    token = authorization.replace("Bearer ", "") if authorization else ""
    context = get_user_context(token) or {"tasks": [], "finance": [], "files": []}
    
    try:
        chat = client.chat.completions.create(
            messages=[
                {"role": "system", "content": build_system_prompt(context)},
                {"role": "user", "content": "Generate a system status report."}
            ],
            model="llama-3.3-70b-versatile",
            max_tokens=150
        )
        return {"message": chat.choices[0].message.content}
    except Exception as e:
        return {"message": "Neural Link Unstable."}

@router.post("/command")
def process_command(cmd: CommandRequest, authorization: str = Header(None)):
    if not client: return {"response": "Voice module offline."}
    token = authorization.replace("Bearer ", "") if authorization else ""
    context = get_user_context(token) or {"tasks": [], "finance": [], "files": []}

    try:
        chat = client.chat.completions.create(
            messages=[
                {"role": "system", "content": build_system_prompt(context)},
                {"role": "user", "content": f"Command: {cmd.command}"}
            ],
            model="llama-3.3-70b-versatile",
            max_tokens=100
        )
        return {"response": chat.choices[0].message.content}
    except Exception as e:
        return {"response": "Command execution failed."}