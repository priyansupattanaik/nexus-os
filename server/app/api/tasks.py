from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.dependencies import get_authenticated_db

router = APIRouter()

class TaskCreate(BaseModel):
    title: str

@router.get("/")
def get_tasks(db = Depends(get_authenticated_db)):
    return db.table("tasks").select("*").order("created_at", desc=True).execute().data

@router.post("/")
def create_task(task: TaskCreate, db = Depends(get_authenticated_db)):
    # FIX: Use pre-validated user_id attached to db object
    data = {"title": task.title, "user_id": db.user_id, "status": "todo"}
    return db.table("tasks").insert(data).execute().data[0]

@router.delete("/{task_id}")
def delete_task(task_id: str, db = Depends(get_authenticated_db)):
    db.table("tasks").delete().eq("id", task_id).execute()
    return {"msg": "Success"}