from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.dependencies import get_authenticated_db

router = APIRouter()

class HabitCreate(BaseModel):
    title: str

@router.get("/")
def get_habits(db = Depends(get_authenticated_db)):
    return db.table("habits").select("*").order("created_at", desc=True).execute().data

@router.post("/")
def create_habit(habit: HabitCreate, db = Depends(get_authenticated_db)):
    data = {"title": habit.title, "user_id": db.user_id, "streak": 0}
    return db.table("habits").insert(data).execute().data[0]

@router.patch("/{habit_id}/increment")
def increment_habit(habit_id: str, db = Depends(get_authenticated_db)):
    curr = db.table("habits").select("streak").eq("id", habit_id).execute().data[0]
    new_streak = curr['streak'] + 1
    db.table("habits").update({"streak": new_streak}).eq("id", habit_id).execute()
    return {"streak": new_streak}

@router.delete("/{habit_id}")
def delete_habit(habit_id: str, db = Depends(get_authenticated_db)):
    db.table("habits").delete().eq("id", habit_id).execute()
    return {"msg": "Deleted"}