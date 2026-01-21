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
    res = db.table("tasks").select("*").order("created_at", desc=True).execute()
    return res.data

@router.post("/")
def create_task(task: TaskCreate, db = Depends(get_authenticated_db)):
    user = db.auth.get_user()
    data = {"title": task.title, "user_id": user.user.id, "status": "todo"}
    res = db.table("tasks").insert(data).execute()
    return res.data[0]

@router.patch("/{task_id}")
def update_task(task_id: str, updates: TaskUpdate, db = Depends(get_authenticated_db)):
    data = {k: v for k, v in updates.dict().items() if v is not None}
    db.table("tasks").update(data).eq("id", task_id).execute()
    return {"msg": "Updated"}

@router.delete("/{task_id}")
def delete_task(task_id: str, db = Depends(get_authenticated_db)):
    db.table("tasks").delete().eq("id", task_id).execute()
    return {"msg": "Deleted"}