from fastapi import APIRouter
from app.services.ai_ops import generate_briefing

router = APIRouter()

@router.get("/briefing")
async def get_briefing():
    response = generate_briefing()
    return {"message": response}