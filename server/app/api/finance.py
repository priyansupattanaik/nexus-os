from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.dependencies import get_authenticated_db

router = APIRouter()

class TransactionCreate(BaseModel):
    description: str
    amount: float
    type: str

@router.get("/")
def get_transactions(db = Depends(get_authenticated_db)):
    return db.table("transactions").select("*").eq("user_id", db.user_id).order("created_at", desc=True).execute().data

@router.post("/")
def add_transaction(txn: TransactionCreate, db = Depends(get_authenticated_db)):
    data = {**txn.dict(), "user_id": db.user_id}
    return db.table("transactions").insert(data).execute().data[0]

@router.delete("/{txn_id}")
def delete_transaction(txn_id: str, db = Depends(get_authenticated_db)):
    db.table("transactions").delete().eq("id", txn_id).eq("user_id", db.user_id).execute()
    return {"msg": "Deleted"}