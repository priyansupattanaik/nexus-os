from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List
from app.services.db import supabase

router = APIRouter()

class TransactionCreate(BaseModel):
    description: str
    amount: float
    type: str  # 'income' or 'expense'

class TransactionResponse(BaseModel):
    id: str
    description: str
    amount: float
    type: str
    created_at: str

@router.get("/", response_model=List[TransactionResponse])
def get_transactions(authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        response = supabase.table("transactions").select("*").order("created_at", desc=True).limit(10).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/", response_model=TransactionResponse)
def add_transaction(txn: TransactionCreate, authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        user_id = supabase.auth.get_user(token).user.id
        
        data = {
            "description": txn.description,
            "amount": txn.amount,
            "type": txn.type,
            "user_id": user_id
        }
        response = supabase.table("transactions").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{txn_id}")
def delete_transaction(txn_id: str, authorization: str = Header(None)):
    try:
        supabase.postgrest.auth(authorization.replace("Bearer ", ""))
        supabase.table("transactions").delete().eq("id", txn_id).execute()
        return {"msg": "Deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))