from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional
from app.services.db import supabase

router = APIRouter()

class FileCreate(BaseModel):
    parent_id: Optional[str] = None
    name: str
    type: str # 'file' or 'folder'
    content: Optional[str] = ""

class FileUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None

@router.get("/")
def get_files(parent_id: Optional[str] = None, authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        
        query = supabase.table("files").select("*").order("type", desc=True).order("name")
        if parent_id:
            query = query.eq("parent_id", parent_id)
        else:
            query = query.is_("parent_id", "null")
            
        return query.execute().data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/")
def create_file(file: FileCreate, authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        user = supabase.auth.get_user(token)
        
        data = {
            "user_id": user.user.id,
            "parent_id": file.parent_id,
            "name": file.name,
            "type": file.type,
            "content": file.content if file.type == 'file' else None
        }
        return supabase.table("files").insert(data).execute().data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{file_id}")
def update_file(file_id: str, updates: FileUpdate, authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        
        data = {}
        if updates.name is not None: data["name"] = updates.name
        if updates.content is not None: data["content"] = updates.content
        
        return supabase.table("files").update(data).eq("id", file_id).execute().data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{file_id}")
def delete_item(file_id: str, authorization: str = Header(None)):
    try:
        token = authorization.replace("Bearer ", "")
        supabase.postgrest.auth(token)
        # Note: A real OS would need recursive delete for folders. 
        # For this version, Supabase cascade delete handles it if configured, or simple delete.
        supabase.table("files").delete().eq("id", file_id).execute()
        return {"msg": "Deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))