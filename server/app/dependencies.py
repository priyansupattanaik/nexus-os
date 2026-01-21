from fastapi import Header, HTTPException
from supabase import create_client, Client
from app.core.config import settings

def get_authenticated_db(authorization: str = Header(...)) -> Client:
    """
    Creates a Supabase client specifically for this request using the user's JWT.
    This ensures RLS (Row Level Security) works correctly and data is saved to the right profile.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    
    try:
        token = authorization.replace("Bearer ", "")
        # Create a client that uses the USER'S token, not the Admin key
        # This forces all queries to respect RLS policies
        client = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_KEY,
            options={'headers': {'Authorization': f'Bearer {token}'}}
        )
        return client
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication Failed: {str(e)}")