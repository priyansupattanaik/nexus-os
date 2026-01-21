from supabase import create_client, Client
from app.core.config import settings

# Global Admin Client (For System Operations Only)
# DO NOT use this for user data fetch/save to avoid security risks
supabase_admin: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)