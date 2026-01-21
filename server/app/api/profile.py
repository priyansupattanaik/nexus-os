from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_authenticated_db

router = APIRouter()

@router.get("/")
def get_profile(db = Depends(get_authenticated_db)):
    try:
        # Fetch the user directly from the secure session
        user_response = db.auth.get_user()
        user = user_response.user
        
        return {
            "id": user.id,
            "email": user.email,
            "last_sign_in_at": user.last_sign_in_at,
            "app_metadata": user.app_metadata,
            "user_metadata": user.user_metadata,
            "aud": user.aud
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))