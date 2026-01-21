from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.dependencies import get_authenticated_db

router = APIRouter()

class TaskCreate(BaseModel):
    title: str

class TaskUpdate(BaseModel):
    status: Optional[str] = None

@router.get("/")
def get_tasks(db = Depends(get_authenticated_db)):
    # Explicitly filter by user_id
    res = db.table("tasks").select("*").eq("user_id", db.user_id).order("created_at", desc=True).execute()
    return res.data

@router.post("/")
def create_task(task: TaskCreate, db = Depends(get_authenticated_db)):
    # Hard-link to the verified user ID
    data = {"title": task.title, "user_id": db.user_id, "status": "todo"}
    res = db.table("tasks").insert(data).execute()
    return res.data[0]

@router.patch("/{task_id}")
def update_task(task_id: str, updates: TaskUpdate, db = Depends(get_authenticated_db)):
    # FIX for 405 error: Ignore requests for temporary frontend IDs
    if not task_id or "." in task_id or len(task_id) < 10:
        return {"msg": "Ignoring sync for temp ID"}
        
    data = {k: v for k, v in updates.dict().items() if v is not None}
    db.table("tasks").update(data).eq("id", task_id).eq("user_id", db.user_id).execute()
    return {"msg": "Updated"}

@router.delete("/{task_id}")
def delete_task(task_id: str, db = Depends(get_authenticated_db)):
    if not task_id or "." in task_id: return {"msg": "Skipped"}
    db.table("tasks").delete().eq("id", task_id).eq("user_id", db.user_id).execute()
    return {"msg": "Deleted"}