from groq import Groq
from app.core.config import settings

# Initialize Groq Client
try:
    client = Groq(
        api_key=settings.GROQ_API_KEY, 
    )
except Exception as e:
    client = None
    print(f"AI Warning: Groq Client failed to initialize. {e}")

SYSTEM_PROMPT = """
You are NEXUS, an advanced AI Personal Operating System. 
Your tone is concise, professional, and slightly futuristic (like JARVIS or FRIDAY).
You do not apologize. You provide direct, actionable insights.
User Context: The user is the System Administrator.
"""

def generate_briefing():
    if not client:
        return "NEXUS Core is offline. API Key missing or invalid."
        
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": "Give me a short, 2-sentence status report on the system. Assume everything is nominal for now."
                }
            ],
            # UPDATED MODEL: Llama 3.3 70B (Newest Version)
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=100,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"AI Error: {e}")
        return "Neural link failed. Unable to process request."