from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional
from app.services.db import supabase

router = APIRouter()

class TaskCreate(BaseModel):
    title: str

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    is_completed: Optional[bool] = None
    status: Optional[str] = None # <<< NEW

class TaskResponse(BaseModel):
    id: str
    title: str
    is_completed: bool
    status: str # <<< NEW
    created_at: str

@router.get("/", response_model=List[TaskResponse])
def get_tasks(authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        response = supabase.table("tasks").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/", response_model=TaskResponse)
def create_task(task: TaskCreate, authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        user = supabase.auth.get_user(token)
        user_id = user.user.id
        
        data = {"title": task.title, "user_id": user_id, "status": "todo", "is_completed": False}
        response = supabase.table("tasks").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{task_id}")
def update_task(task_id: str, updates: TaskUpdate, authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        
        data = {}
        if updates.title is not None: data["title"] = updates.title
        if updates.status is not None: 
            data["status"] = updates.status
            # Keep is_completed synced for backward compatibility
            data["is_completed"] = True if updates.status == 'done' else False
            
        supabase.table("tasks").update(data).eq("id", task_id).execute()
        return {"msg": "Updated"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{task_id}")
def delete_task(task_id: str, authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        supabase.table("tasks").delete().eq("id", task_id).execute()
        return {"msg": "Deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))