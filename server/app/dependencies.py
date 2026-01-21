from fastapi import Header, HTTPException
from supabase import create_client, Client
from app.core.config import settings

def get_authenticated_db(authorization: str = Header(...)) -> Client:
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized: No Token")
    
    try:
        token = authorization.replace("Bearer ", "")
        
        # Instantiate localized client for RLS bypass/enforcement
        client = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_KEY,
            options={'headers': {'Authorization': f'Bearer {token}'}}
        )
        
        # Verify user and cache it on the client
        user_res = client.auth.get_user(token)
        if not user_res or not user_res.user:
            raise HTTPException(status_code=401, detail="Invalid Session")
            
        client.user_id = user_res.user.id
        client.user = user_res.user
        
        return client
    except Exception as e:
        print(f"CRITICAL DB CONNECT ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Database Connection Refused")