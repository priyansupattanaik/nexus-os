from supabase import create_client, Client
from app.core.config import settings

# Global Admin Client (For System Operations & Debugging Only)
# WARNING: Do not use this for user queries (Tasks, Finance, etc.)
supabase_admin: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)