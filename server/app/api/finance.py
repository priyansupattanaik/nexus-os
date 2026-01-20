from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional
from app.services.db import supabase

router = APIRouter()

class TransactionCreate(BaseModel):
    description: str
    amount: float
    type: str  # "income" or "expense"

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
        # Auth with Supabase using YOUR token (enforces RLS)
        supabase.postgrest.auth(token)
        response = supabase.table("transactions").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail="Sync failed")

@router.post("/", response_model=TransactionResponse)
def add_transaction(txn: TransactionCreate, authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        # Explicitly get User ID to be safe
        user = supabase.auth.get_user(token)
        user_id = user.user.id
        
        data = {
            "description": txn.description,
            "amount": txn.amount,
            "type": txn.type,
            "user_id": user_id  # <<< SYNC TO PROFILE
        }
        response = supabase.table("transactions").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail="Save failed")

@router.delete("/{txn_id}")
def delete_transaction(txn_id: str, authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        supabase.table("transactions").delete().eq("id", txn_id).execute()
        return {"msg": "Deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Delete failed")