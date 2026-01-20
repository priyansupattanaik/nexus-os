from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List
from app.services.db import supabase

router = APIRouter()

class HabitCreate(BaseModel):
    title: str

class HabitResponse(BaseModel):
    id: str
    title: str
    streak: int
    created_at: str

@router.get("/", response_model=List[HabitResponse])
def get_habits(authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        response = supabase.table("habits").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/", response_model=HabitResponse)
def create_habit(habit: HabitCreate, authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        user = supabase.auth.get_user(token)
        
        data = {
            "title": habit.title,
            "streak": 0,
            "user_id": user.user.id # <<< SYNC TO PROFILE
        }
        response = supabase.table("habits").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{habit_id}/increment")
def increment_habit(habit_id: str, authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        
        # 1. Get current streak
        current = supabase.table("habits").select("streak").eq("id", habit_id).execute()
        if not current.data:
            raise HTTPException(status_code=404, detail="Habit not found")
            
        new_streak = current.data[0]['streak'] + 1
        
        # 2. Update
        supabase.table("habits").update({"streak": new_streak}).eq("id", habit_id).execute()
        return {"streak": new_streak}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{habit_id}")
def delete_habit(habit_id: str, authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        supabase.table("habits").delete().eq("id", habit_id).execute()
        return {"msg": "Deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))