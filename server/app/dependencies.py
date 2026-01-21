from fastapi import Header, HTTPException
from supabase import create_client, Client
from app.core.config import settings

def get_authenticated_db(authorization: str = Header(None)) -> Client:
    """
    Ensures the user is fully authenticated before allowing DB access.
    Attaches the user object directly to the client for downstream use.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required: No token found.")
    
    try:
        token = authorization.replace("Bearer ", "")
        
        # Initialize client with user token to respect RLS
        client = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_KEY,
            options={'headers': {'Authorization': f'Bearer {token}'}}
        )
        
        # Verification step: Ensure the token is valid for this session
        user_res = client.auth.get_user(token)
        if not user_res or not user_res.user:
            raise HTTPException(status_code=401, detail="Session invalid or expired.")
            
        # Store context for the route handler
        client.user_id = user_res.user.id
        client.user = user_res.user
        
        return client
    except Exception as e:
        print(f"CRITICAL HANDSHAKE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Database uplink failed.")