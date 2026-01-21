from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_authenticated_db

router = APIRouter()

@router.get("/")
def get_profile(db = Depends(get_authenticated_db)):
    try:
        user_response = db.auth.get_user()
        return user_response.user
    except Exception as e:
        raise HTTPException(status_code=400, detail="Profile Fetch Failed")