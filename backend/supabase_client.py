from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Print for debugging (you can remove later)
print("SUPABASE_URL:", SUPABASE_URL)
print("SUPABASE_SERVICE_KEY:", "Loaded" if SUPABASE_SERVICE_KEY else "Missing")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("Missing Supabase environment variables. Check your .env file.")

# Create the Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
