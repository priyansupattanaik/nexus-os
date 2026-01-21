from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.dependencies import get_authenticated_db

router = APIRouter()

class FileCreate(BaseModel):
    parent_id: Optional[str] = None
    name: str
    type: str 
    content: Optional[str] = ""

@router.get("/")
def get_files(parent_id: Optional[str] = None, db = Depends(get_authenticated_db)):
    query = db.table("files").select("*").eq("user_id", db.user_id).order("type", desc=True).order("name")
    if parent_id:
        query = query.eq("parent_id", parent_id)
    else:
        query = query.is_("parent_id", "null")
    return query.execute().data

@router.post("/")
def create_file(file: FileCreate, db = Depends(get_authenticated_db)):
    data = {
        "user_id": db.user_id,
        "parent_id": file.parent_id,
        "name": file.name,
        "type": file.type,
        "content": file.content
    }
    return db.table("files").insert(data).execute().data[0]

@router.delete("/{file_id}")
def delete_file(file_id: str, db = Depends(get_authenticated_db)):
    db.table("files").delete().eq("id", file_id).eq("user_id", db.user_id).execute()
    return {"msg": "Deleted"}