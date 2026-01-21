from fastapi import Header, HTTPException
from supabase import create_client, Client
from app.core.config import settings

def get_authenticated_db(authorization: str = Header(None)) -> Client:
    """
    Standardizes the Auth Handshake. 
    Logs failures to the server console for debugging.
    """
    if not authorization or not authorization.startswith("Bearer "):
        print("KERNEL ERROR: No Bearer token provided by client.")
        raise HTTPException(status_code=401, detail="Authentication Required")
    
    try:
        token = authorization.replace("Bearer ", "")
        
        # 1. Init Client
        # IMPORTANT: Ensure SUPABASE_KEY on Render is the SERVICE_ROLE_KEY
        client = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_KEY,
            options={'headers': {'Authorization': f'Bearer {token}'}}
        )
        
        # 2. Extract User
        user_res = client.auth.get_user(token)
        if not user_res or not user_res.user:
            print("KERNEL ERROR: Supabase rejected the JWT.")
            raise HTTPException(status_code=401, detail="Session Invalid")
            
        # 3. Inject ID for direct use in API routes
        client.user_id = user_res.user.id
        return client
        
    except Exception as e:
        print(f"KERNEL CRITICAL: Auth exception -> {str(e)}")
        raise HTTPException(status_code=401, detail="OS Handshake Failed")