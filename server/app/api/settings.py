from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.dependencies import get_authenticated_db

router = APIRouter()

class SettingsUpdate(BaseModel):
    theme_accent: Optional[str] = None
    wallpaper_id: Optional[str] = None
    sound_volume: Optional[float] = None
    notifications: Optional[bool] = None

@router.get("/")
def get_settings(db = Depends(get_authenticated_db)):
    # Explicitly filter by user_id
    response = db.table("settings").select("*").eq("user_id", db.user_id).execute()
    if not response.data:
        default = {"user_id": db.user_id}
        db.table("settings").insert(default).execute()
        return default
    return response.data[0]

@router.patch("/")
def update_settings(settings: SettingsUpdate, db = Depends(get_authenticated_db)):
    data = {k: v for k, v in settings.dict().items() if v is not None}
    data["user_id"] = db.user_id
    # Upsert with user_id ensures we only touch this user's settings
    return db.table("settings").upsert(data).execute().data[0]