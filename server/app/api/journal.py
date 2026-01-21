from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.dependencies import get_authenticated_db

router = APIRouter()

class EntryCreate(BaseModel):
    content: str

@router.get("/")
def get_entries(db = Depends(get_authenticated_db)):
    return db.table("journal_entries").select("*").order("created_at", desc=True).execute().data

@router.post("/")
def create_entry(entry: EntryCreate, db = Depends(get_authenticated_db)):
    user = db.auth.get_user()
    data = {"content": entry.content, "user_id": user.user.id}
    return db.table("journal_entries").insert(data).execute().data[0]

@router.delete("/{entry_id}")
def delete_entry(entry_id: str, db = Depends(get_authenticated_db)):
    db.table("journal_entries").delete().eq("id", entry_id).execute()
    return {"msg": "Deleted"}