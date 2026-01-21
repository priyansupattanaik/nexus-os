from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from app.services.db import supabase

router = APIRouter()

class SettingsUpdate(BaseModel):
    theme_accent: Optional[str] = None
    wallpaper_id: Optional[str] = None
    sound_volume: Optional[float] = None
    notifications: Optional[bool] = None

@router.get("/")
def get_settings(authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        
        response = supabase.table("settings").select("*").execute()
        if not response.data:
            # Create default settings if none exist
            user = supabase.auth.get_user(token)
            default = {"user_id": user.user.id}
            return supabase.table("settings").insert(default).execute().data[0]
            
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/")
def update_settings(settings: SettingsUpdate, authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        user = supabase.auth.get_user(token)
        
        # Upsert ensures row exists
        data = {k: v for k, v in settings.dict().items() if v is not None}
        data["user_id"] = user.user.id
        
        return supabase.table("settings").upsert(data).execute().data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))