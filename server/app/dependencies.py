from fastapi import Header, HTTPException
from supabase import create_client, Client
from app.core.config import settings

def get_authenticated_db(authorization: str = Header(...)) -> Client:
    """
    Creates a temporary, secure connection for THIS specific request.
    This ensures User A cannot see User B's data (RLS Policy Enforcement).
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="No Authorization Header")
    
    try:
        token = authorization.replace("Bearer ", "")
        # Initialize Supabase with the USER'S token
        client = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_KEY,
            options={'headers': {'Authorization': f'Bearer {token}'}}
        )
        return client
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=401, detail="Session Expired")