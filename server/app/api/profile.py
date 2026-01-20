from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from app.services.db import supabase

router = APIRouter()

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

@router.get("/")
def get_profile(authorization: str = Header(None)):
    """Fetch the current user's profile."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Token")

    try:
        token = authorization.replace("Bearer ", "")
        user = supabase.auth.get_user(token)
        user_id = user.user.id
        
        # Fetch from the profiles table
        response = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        return response.data
    except Exception as e:
        # If profile is missing (rare), return basic info from auth
        return {"id": user_id, "email": user.user.email}

@router.patch("/")
def update_profile(profile: ProfileUpdate, authorization: str = Header(None)):
    """Update profile details."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Token")

    try:
        token = authorization.replace("Bearer ", "")
        user = supabase.auth.get_user(token)
        user_id = user.user.id
        
        data = {k: v for k, v in profile.dict().items() if v is not None}
        
        response = supabase.table("profiles").update(data).eq("id", user_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))