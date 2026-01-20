from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional
from app.services.db import supabase

router = APIRouter()

class EntryCreate(BaseModel):
    content: str
    mood: Optional[str] = "neutral"

class EntryResponse(BaseModel):
    id: str
    content: str
    mood: str
    created_at: str

@router.get("/", response_model=List[EntryResponse])
def get_entries(authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        response = supabase.table("journal_entries").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/", response_model=EntryResponse)
def create_entry(entry: EntryCreate, authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        user_id = supabase.auth.get_user(token).user.id
        
        data = {"content": entry.content, "mood": entry.mood, "user_id": user_id}
        response = supabase.table("journal_entries").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{entry_id}")
def delete_entry(entry_id: str, authorization: str = Header(None)):
    try:
        supabase.postgrest.auth(authorization.replace("Bearer ", ""))
        supabase.table("journal_entries").delete().eq("id", entry_id).execute()
        return {"msg": "Deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))