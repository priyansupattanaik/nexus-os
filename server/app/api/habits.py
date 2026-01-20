from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List
from datetime import datetime, timezone
from app.services.db import supabase

router = APIRouter()

class HabitCreate(BaseModel):
    title: str

class HabitResponse(BaseModel):
    id: str
    title: str
    streak: int
    last_completed_at: str | None

@router.get("/", response_model=List[HabitResponse])
def get_habits(authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        response = supabase.table("habits").select("*").order("created_at").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/", response_model=HabitResponse)
def create_habit(habit: HabitCreate, authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        user_id = supabase.auth.get_user(token).user.id
        
        data = {"title": habit.title, "user_id": user_id, "streak": 0}
        response = supabase.table("habits").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{habit_id}/increment")
def increment_habit(habit_id: str, authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        
        # Get current habit
        result = supabase.table("habits").select("*").eq("id", habit_id).execute()
        if not result.data:
            raise HTTPException(404, "Habit not found")
            
        habit = result.data[0]
        current_streak = habit['streak']
        
        # Simple streak logic: Always increment for now (You can add 24h checks later)
        update_data = {
            "streak": current_streak + 1,
            "last_completed_at": datetime.now(timezone.utc).isoformat()
        }
        
        response = supabase.table("habits").update(update_data).eq("id", habit_id).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{habit_id}")
def delete_habit(habit_id: str, authorization: str = Header(None)):
    try:
        supabase.postgrest.auth(authorization.replace("Bearer ", ""))
        supabase.table("habits").delete().eq("id", habit_id).execute()
        return {"msg": "Deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))