from fastapi import Header, HTTPException
from supabase import create_client, Client
from app.core.config import settings

def get_authenticated_db(authorization: str = Header(...)) -> Client:
    """
    Creates a secure, user-locked Supabase client.
    Extracts the user ID immediately to prevent "Nothing Saved" errors.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Token")
    
    try:
        token = authorization.replace("Bearer ", "")
        
        # 1. Initialize client with user token to bypass/obey RLS correctly
        client = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_KEY,
            options={'headers': {'Authorization': f'Bearer {token}'}}
        )
        
        # 2. Explicitly fetch the user to verify the token is alive
        user_response = client.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Session Expired")
            
        # 3. ATTACH DATA DIRECTLY TO CLIENT (This fixes the "tasks" bug)
        client.user_id = user_response.user.id
        client.user_email = user_response.user.email
        
        return client
    except Exception as e:
        print(f"Auth Critical Failure: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid Security Token")