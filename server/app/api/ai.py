from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from groq import Groq
from app.core.config import settings
from app.services.db import supabase
import json

router = APIRouter()

try:
    client = Groq(api_key=settings.GROQ_API_KEY)
except Exception as e:
    client = None
    print(f"AI Warning: {e}")

class CommandRequest(BaseModel):
    command: str

def get_user_context(token: str):
    """Fetches user's live data to give the AI context."""
    try:
        supabase.postgrest.auth(token)
        
        # 1. Fetch Tasks
        tasks = supabase.table("tasks").select("title, status").limit(10).execute()
        task_list = [f"{t['title']} ({t['status']})" for t in tasks.data]
        
        # 2. Fetch Finance
        txns = supabase.table("transactions").select("description, amount, type").order("created_at", desc=True).limit(5).execute()
        finance_list = [f"{t['description']} ({'+' if t['type']=='income' else '-'}${t['amount']})" for t in txns.data]
        
        # 3. Fetch Habits
        habits = supabase.table("habits").select("title, streak").order("streak", desc=True).execute()
        habit_list = [f"{h['title']} (Streak: {h['streak']})" for h in habits.data]

        # 4. Fetch Journal/Dreams (Recent)
        entries = supabase.table("journal_entries").select("content, mood").order("created_at", desc=True).limit(3).execute()
        journal_list = [f"{e['content']} [{e['mood']}]" for e in entries.data]

        return {
            "tasks": task_list,
            "finance": finance_list,
            "habits": habit_list,
            "journal": journal_list
        }
    except Exception as e:
        print(f"Context Error: {e}")
        return None

def build_system_prompt(context: dict):
    return f"""
    You are NEXUS, a hyper-intelligent AI OS.
    
    [USER DATA STREAM]
    TASKS: {"; ".join(context['tasks']) if context['tasks'] else "None"}
    FINANCE: {"; ".join(context['finance']) if context['finance'] else "No recent data"}
    HABITS: {"; ".join(context['habits']) if context['habits'] else "None"}
    RECENT LOGS: {"; ".join(context['journal']) if context['journal'] else "None"}

    [PROTOCOLS]
    1. Be concise, tactical, and direct. No fluff.
    2. If the user asks about money, tasks, or logs, USE the data above.
    3. Respond in a Cyberpunk / Jarvis persona.
    """

@router.get("/briefing")
def get_briefing(authorization: str = Header(None)):
    if not client: return {"message": "AI Module Offline."}
    
    token = authorization.replace("Bearer ", "") if authorization else ""
    context = get_user_context(token) or {"tasks": [], "finance": [], "habits": [], "journal": []}
    
    try:
        chat = client.chat.completions.create(
            messages=[
                {"role": "system", "content": build_system_prompt(context)},
                {"role": "user", "content": "Generate a tactical sitrep/briefing based on my current status."}
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
    context = get_user_context(token) or {"tasks": [], "finance": [], "habits": [], "journal": []}

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