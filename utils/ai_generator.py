"""
utils/ai_generator.py
---------------------
Core module for Google Gemini API integration using the official `google-genai` Python SDK.
Constructs safe, well-structured prompts and generates personalized emails and messages.
"""

import os
from typing import Dict, Any, Tuple
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Attempt import of official google-genai SDK
try:
    from google import genai
    from google.genai import types
    from google.genai.errors import APIError
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    APIError = Exception


def get_gemini_client() -> Tuple[Any, str]:
    """
    Initializes and returns the Google Gemini Client using the GEMINI_API_KEY.
    Returns:
        (client, error_message)
    """
    if not GENAI_AVAILABLE:
        return None, "The 'google-genai' library is not installed. Run: pip install google-genai"

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key or api_key == "YOUR_GEMINI_API_KEY_HERE":
        return None, "Gemini API key is missing. Please set GEMINI_API_KEY in your .env file or Streamlit sidebar."

    try:
        client = genai.Client(api_key=api_key)
        return client, ""
    except Exception as e:
        return None, f"Failed to initialize Gemini Client: {str(e)}"


def build_generation_prompt(
    content_type: str,
    purpose: str,
    recipient: str,
    sender: str,
    context: str,
    tone: str,
    length: str,
    language: str
) -> str:
    """
    Constructs a disciplined, anti-hallucination prompt for the Gemini LLM.
    Strictly instructs the model NOT to fabricate personal details or events.
    """
    sender_instruction = f"Sender Name: '{sender}'" if sender else "Sender Name: Not provided (use a polite sign-off or leave a placeholder like '[Your Name]')."
    
    length_guidelines = {
        "Short": "Keep it brief, concise, and straight to the point (around 50-90 words).",
        "Medium": "Standard length with polite opening, clear body paragraphs, and professional closing (around 100-180 words).",
        "Detailed": "Comprehensive and thorough, providing full background, details, action items, and polite assurances (around 200-300 words)."
    }.get(length, "Medium length")

    language_instruction = {
        "English": "Write entirely in natural, fluent English.",
        "Hindi": "Write in pure, natural Hindi (Devanagari script).",
        "Hinglish": "Write in natural conversational Hinglish (Hindi written in Roman/Latin script, as commonly typed on WhatsApp/messaging apps)."
    }.get(language, "Write in English.")

    if content_type.lower() == "email":
        format_guide = """
Output Format Requirements:
- Start with 'Subject: <Clear, concise, professional subject line>'
- Add a blank line.
- Salutation / Greeting addressing the recipient.
- Body paragraphs matching the requested tone and length.
- Professional sign-off / closing phrase.
- Sender name (if provided) or '[Your Name]'.
Do NOT wrap the response in markdown code blocks (e.g. do not put ```markdown or ```). Return directly formatted text.
"""
    else:
        format_guide = """
Output Format Requirements:
- A direct, natural message suitable for WhatsApp, SMS, or Slack/Teams.
- Include appropriate greeting and sign-off suited to the selected tone.
- If the tone is 'Casual' or 'Friendly', subtle tasteful emojis are welcome.
- If the tone is 'Formal' or 'Professional', keep it crisp, courteous, and polite without excessive emojis.
Do NOT include a 'Subject:' line for messages.
Do NOT wrap the response in markdown code blocks.
"""

    prompt = f"""You are an expert communication specialist and writing mentor.
Your task is to draft a personalized {content_type.upper()} tailored specifically to the user's requirements.

### Key Instructions & Guardrails:
1. STRICT FACTUALITY: Do NOT invent, assume, or hallucinate personal details, specific past events, fake dates, phone numbers, addresses, or university/company names that the user did not provide.
2. If any necessary specific detail (such as a date, roll number, or meeting time) is missing, use clear bracketed placeholders like [Date], [Time], or [Document Name] so the user can easily fill it in.
3. Match the specified tone strictly: {tone}.
4. Adhere to the requested length: {length} ({length_guidelines}).
5. Target Language: {language} ({language_instruction}).

### Input Parameters:
- Content Type: {content_type}
- Stated Purpose: {purpose}
- Recipient: {recipient}
- {sender_instruction}
- User Context & Key Details:
{context}

### Required Output:
{format_guide}
"""
    return prompt.strip()


def generate_content(
    content_type: str,
    purpose: str,
    recipient: str,
    sender: str,
    context: str,
    tone: str,
    length: str,
    language: str,
    custom_model: str = None
) -> Tuple[str, str]:
    """
    Calls the Gemini API using the official `google-genai` Python SDK.
    Returns:
        (generated_text, error_message)
    """
    # Basic input validation
    if not recipient.strip():
        return "", "Recipient is required. Please specify who this message/email is addressed to."
    if not purpose.strip():
        return "", "Purpose is required. Please specify or select a purpose."
    if not context.strip():
        return "", "Context/Details is required. Please provide key facts so the AI can craft an accurate draft."

    client, err = get_gemini_client()
    if err:
        return "", err

    # Configurable model name with fallback
    model_name = custom_model or os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    # Construct disciplined prompt
    prompt = build_generation_prompt(
        content_type=content_type,
        purpose=purpose,
        recipient=recipient,
        sender=sender,
        context=context,
        tone=tone,
        length=length,
        language=language
    )

    try:
        # Call Gemini API via modern SDK
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
        )

        if not response or not response.text:
            return "", "The model returned an empty response. Please try again with slightly more context."

        return response.text.strip(), ""

    except APIError as ae:
        # Handle specific Google GenAI API errors
        error_msg = str(ae)
        if "RESOURCE_EXHAUSTED" in error_msg or "429" in error_msg:
            return "", "API rate limit or quota exceeded. Please wait a minute before retrying, or check your Gemini API plan."
        elif "PERMISSION_DENIED" in error_msg or "API_KEY_INVALID" in error_msg or "403" in error_msg:
            return "", "Invalid Gemini API key or insufficient permissions. Verify your key at https://aistudio.google.com/."
        elif "NOT_FOUND" in error_msg or "404" in error_msg:
            return "", f"Model '{model_name}' was not found or is unsupported for your key. Try setting GEMINI_MODEL=gemini-2.5-flash."
        else:
            return "", f"Gemini API Error: {error_msg}"

    except Exception as e:
        error_str = str(e)
        if "API_KEY" in error_str.upper():
            return "", "API Key authentication error. Please ensure your GEMINI_API_KEY is valid."
        elif "network" in error_str.lower() or "connection" in error_str.lower():
            return "", "Network connectivity issue while reaching Google AI servers. Check your internet connection."
        return "", f"An unexpected error occurred during generation: {error_str}"
