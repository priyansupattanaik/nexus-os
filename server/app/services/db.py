from supabase import create_client, Client
from app.core.config import settings

# Initialize Supabase Client centrally
# This allows other files (like tasks.py) to import 'supabase' directly
try:
    supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
except Exception as e:
    print(f"Warning: Supabase client failed to initialize. {e}")
    supabase = None