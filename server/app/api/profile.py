from fastapi import APIRouter, Depends
from app.dependencies import get_authenticated_db

router = APIRouter()

@router.get("/")
def get_profile(db = Depends(get_authenticated_db)):
    # db.user is now guaranteed to exist by the dependency
    return db.user