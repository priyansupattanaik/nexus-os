from fastapi import Header, HTTPException
from supabase import create_client, Client
from app.core.config import settings

def get_authenticated_db(authorization: str = Header(...)) -> Client:
    """
    1. Creates a Supabase client with the User's Token (for RLS).
    2. Verifies the Token with Supabase Auth.
    3. Attaches 'user_id' and 'user' to the client object for easy access.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="No Authorization Header")
    
    try:
        token = authorization.replace("Bearer ", "")
        
        # 1. Init Client with Headers (For Table RLS)
        client = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_KEY,
            options={'headers': {'Authorization': f'Bearer {token}'}}
        )
        
        # 2. Explicitly Verify Token (For User ID)
        user_response = client.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid Token")
            
        # 3. Attach User Context to Client (The "Hack" that fixes everything)
        client.user_id = user_response.user.id
        client.user = user_response.user
        
        return client
        
    except Exception as e:
        print(f"Auth Critical Failure: {e}")
        raise HTTPException(status_code=401, detail="Session Expired or Invalid")