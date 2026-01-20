from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
from app.core.config import settings

router = APIRouter()

try:
    client = Groq(api_key=settings.GROQ_API_KEY)
except Exception as e:
    client = None
    print(f"AI Warning: {e}")

class CommandRequest(BaseModel):
    command: str

SYSTEM_PROMPT = """
You are NEXUS, a futuristic AI OS.
Your responses must be concise, robotic but helpful, and sound like JARVIS.
Maximum 2 sentences.
"""

@router.get("/briefing")
def get_briefing():
    if not client:
        return {"message": "AI Module Offline."}
    try:
        chat = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": "Status report."}
            ],
            model="llama-3.3-70b-versatile",
            max_tokens=100
        )
        return {"message": chat.choices[0].message.content}
    except Exception as e:
        return {"message": "Neural Link Unstable."}

@router.post("/command")
def process_command(cmd: CommandRequest):
    if not client:
        return {"response": "Voice module offline."}
    try:
        chat = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"User command: {cmd.command}. Respond as if executing or acknowledging it."}
            ],
            model="llama-3.3-70b-versatile",
            max_tokens=100
        )
        return {"response": chat.choices[0].message.content}
    except Exception as e:
        return {"response": "I could not process that command."}