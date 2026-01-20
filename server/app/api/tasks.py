from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional
from app.services.db import supabase

router = APIRouter()

# --- Pydantic Models (Data Validation) ---
class TaskCreate(BaseModel):
    title: str

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    is_completed: Optional[bool] = None

class TaskResponse(BaseModel):
    id: str
    title: str
    is_completed: bool
    created_at: str

# --- Endpoints ---

@router.get("/", response_model=List[TaskResponse])
def get_tasks(authorization: str = Header(None)):
    """Fetch all tasks for the logged-in user."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    try:
        # Pass the user's token to Supabase so RLS policies work
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        
        response = supabase.table("tasks").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/", response_model=TaskResponse)
def create_task(task: TaskCreate, authorization: str = Header(None)):
    """Create a new task."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        
        # Get user ID from token to insert correctly
        user = supabase.auth.get_user(token)
        user_id = user.user.id

        data = {"title": task.title, "user_id": user_id}
        response = supabase.table("tasks").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: str, task: TaskUpdate, authorization: str = Header(None)):
    """Update a task (toggle completion or change title)."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    try:
        supabase.postgrest.auth(authorization.replace("Bearer ", ""))
        
        update_data = {}
        if task.title is not None:
            update_data["title"] = task.title
        if task.is_completed is not None:
            update_data["is_completed"] = task.is_completed

        response = supabase.table("tasks").update(update_data).eq("id", task_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Task not found")
            
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{task_id}")
def delete_task(task_id: str, authorization: str = Header(None)):
    """Delete a task."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    try:
        supabase.postgrest.auth(authorization.replace("Bearer ", ""))
        response = supabase.table("tasks").delete().eq("id", task_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Task not found")
            
        return {"message": "Task deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))