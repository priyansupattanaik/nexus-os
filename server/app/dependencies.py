from fastapi import Header, HTTPException, Depends
from supabase import create_client, Client
from app.core.config import settings

def get_authenticated_db(authorization: str = Header(...)) -> Client:
    """
    Validates user session and returns a DB client locked to their ID.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid Header")
    
    try:
        token = authorization.replace("Bearer ", "")
        
        # Local client with user token to force RLS compliance
        client = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_KEY,
            options={'headers': {'Authorization': f'Bearer {token}'}}
        )
        
        # Crucial: Verify token with Supabase and extract user identity
        user_response = client.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Session expired")
            
        # Attach user data to the client object for use in routes
        client.user_id = user_response.user.id
        client.user = user_response.user
        
        return client
    except Exception as e:
        print(f"Connection Error: {e}")
        raise HTTPException(status_code=500, detail="Database uplink failed")