from fastapi import Header, HTTPException
from supabase import create_client, Client
from app.core.config import settings

def get_authenticated_db(authorization: str = Header(None)) -> Client:
    """
    Validates the User JWT and returns a database client.
    Note: The returned client uses the Service Role Key, so RLS is bypassed.
    You MUST filter by client.user_id in your queries.
    """
    if not authorization or not authorization.startswith("Bearer "):
        print("DEBUG: Missing or invalid Authorization header")
        raise HTTPException(status_code=401, detail="Authentication Required")
    
    try:
        token = authorization.replace("Bearer ", "")
        
        # Initialize client with Service Role Key
        # We do NOT pass the user token in headers here because we are using the Service Role Key
        # which grants admin access. We will verify the token explicitly below.
        client = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_KEY
        )
        
        # Verify user with Supabase Auth
        user_res = client.auth.get_user(token)

        if not user_res or not user_res.user:
            print("DEBUG: Supabase rejected the token (no user returned)")
            raise HTTPException(status_code=401, detail="Session Expired")
            
        # Hardwire the User ID and User object into the client for route access
        client.user_id = user_res.user.id
        client.user = user_res.user

        return client
        
    except Exception as e:
        print(f"DEBUG: Auth Handshake Error: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=401, detail="Handshake Failed")
