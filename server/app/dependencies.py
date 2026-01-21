from fastapi import Header, HTTPException
from supabase import create_client, Client
from app.core.config import settings

def get_authenticated_db(authorization: str = Header(None)) -> Client:
    """
    Validates the User JWT and returns a database client locked to that user.
    """
    if not authorization or not authorization.startswith("Bearer "):
        print("DEBUG: Missing or invalid Authorization header")
        raise HTTPException(status_code=401, detail="Authentication Required")
    
    try:
        token = authorization.replace("Bearer ", "")
        
        # Initialize client
        # IMPORTANT: SUPABASE_KEY on the server MUST be the SERVICE_ROLE_KEY
        client = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_KEY,
            options={'headers': {'Authorization': f'Bearer {token}'}}
        )
        
        # Verify user with Supabase Auth
        user_res = client.auth.get_user(token)
        if not user_res or not user_res.user:
            print("DEBUG: Supabase rejected the token")
            raise HTTPException(status_code=401, detail="Session Expired")
            
        # Hardwire the User ID into the client for route access
        client.user_id = user_res.user.id
        return client
        
    except Exception as e:
        print(f"DEBUG: Auth Handshake Error: {str(e)}")
        raise HTTPException(status_code=401, detail="Handshake Failed")