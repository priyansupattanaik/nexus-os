from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.dependencies import get_authenticated_db

router = APIRouter()

class EntryCreate(BaseModel):
    content: str
    mood: str = "neutral"

@router.get("/")
def get_entries(db = Depends(get_authenticated_db)):
    return db.table("journal_entries").select("*").eq("user_id", db.user_id).order("created_at", desc=True).execute().data

@router.post("/")
def create_entry(entry: EntryCreate, db = Depends(get_authenticated_db)):
    data = {"content": entry.content, "mood": entry.mood, "user_id": db.user_id}
    return db.table("journal_entries").insert(data).execute().data[0]

@router.delete("/{entry_id}")
def delete_entry(entry_id: str, db = Depends(get_authenticated_db)):
    db.table("journal_entries").delete().eq("id", entry_id).eq("user_id", db.user_id).execute()
    return {"msg": "Deleted"}