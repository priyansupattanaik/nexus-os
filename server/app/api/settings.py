from fastapi import APIRouter, HTTPException, Depends
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
    try:
        # Get Current User
        user = db.auth.get_user()
        
        # Fetch Settings
        response = db.table("settings").select("*").eq("user_id", user.user.id).execute()
        
        if not response.data:
            # Create default settings if none exist
            default = {"user_id": user.user.id}
            db.table("settings").insert(default).execute()
            return default
            
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/")
def update_settings(settings: SettingsUpdate, db = Depends(get_authenticated_db)):
    try:
        user = db.auth.get_user()
        
        # Clean Data
        data = {k: v for k, v in settings.dict().items() if v is not None}
        data["user_id"] = user.user.id
        
        # Upsert
        return db.table("settings").upsert(data).execute().data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))