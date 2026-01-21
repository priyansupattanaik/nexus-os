from fastapi import Header, HTTPException
from supabase import create_client, Client
from app.core.config import settings

def get_authenticated_db(authorization: str = Header(...)) -> Client:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized: No Security Token")
    
    try:
        token = authorization.replace("Bearer ", "")
        client = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_KEY,
            options={'headers': {'Authorization': f'Bearer {token}'}}
        )
        user_response = client.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Session Expired")
            
        # Hardwire identity into the client
        client.user_id = user_response.user.id
        return client
    except Exception as e:
        print(f"CRITICAL AUTH FAILURE: {str(e)}")
        raise HTTPException(status_code=401, detail="Handshake Failed")