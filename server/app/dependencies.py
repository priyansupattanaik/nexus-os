from fastapi import Header, HTTPException
from supabase import create_client, Client
from app.core.config import settings

def get_authenticated_db(authorization: str = Header(...)) -> Client:
    """
    Ensures every request is tied to a specific user.
    Prevents 'Empty Data' bugs by pre-validating the JWT.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized: Token Missing")
    
    try:
        token = authorization.replace("Bearer ", "")
        
        # Initialize Supabase client with the user's token to obey RLS policies
        client = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_KEY,
            options={'headers': {'Authorization': f'Bearer {token}'}}
        )
        
        # Verify the session is still active
        user_response = client.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Session Expired")
            
        # Attach validated user data to the client for route access
        client.user_id = user_response.user.id
        client.user = user_response.user
        
        return client
    except Exception as e:
        print(f"CRITICAL AUTH ERROR: {str(e)}")
        raise HTTPException(status_code=401, detail="Database Handshake Refused")