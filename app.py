"""
app.py
------
Streamlit Web Application for AI-Powered Email and Message Generator.
Built for College Mini-Project Demonstration with Google Gemini API.
"""

import streamlit as st
import os
from dotenv import load_dotenv
from utils.ai_generator import generate_content

# Load environment variables
load_dotenv()

# Page configuration
st.set_page_config(
    page_title="AI Email & Message Generator",
    page_icon="✉️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom styling for clean, professional college mini-project UI
st.markdown("""
<style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 800;
        color: #1E293B;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        font-size: 1.05rem;
        color: #475569;
        margin-bottom: 1.5rem;
    }
    .badge-pill {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        font-size: 0.8rem;
        font-weight: 600;
        border-radius: 9999px;
        background-color: #EEF2FF;
        color: #4338CA;
        margin-bottom: 0.5rem;
        border: 1px solid #C7D2FE;
    }
    .footer-note {
        text-align: center;
        margin-top: 3rem;
        padding: 1.25rem;
        border-top: 1px solid #E2E8F0;
        color: #64748B;
        font-size: 0.85rem;
    }
    .stTextArea textarea {
        font-family: inherit;
    }
</style>
""", unsafe_allow_html=True)

# Initialize Session State
if "generated_output" not in st.session_state:
    st.session_state.generated_output = ""
if "last_prompt_details" not in st.session_state:
    st.session_state.last_prompt_details = {}
if "is_generating" not in st.session_state:
    st.session_state.is_generating = False

# Sidebar Configuration
with st.sidebar:
    st.markdown('<div class="badge-pill">🎓 Academic Mini-Project</div>', unsafe_allow_html=True)
    st.title("⚙️ Settings & Info")
    
    # API Key Configuration
    st.subheader("1. API Configuration")
    env_api_key = os.getenv("GEMINI_API_KEY", "")
    
    if env_api_key and env_api_key != "YOUR_GEMINI_API_KEY_HERE":
        st.success("✅ API Key detected from `.env`")
        custom_key = st.text_input("Override API Key (Optional)", type="password", help="Leave blank to use the key from your .env file")
        active_api_key = custom_key.strip() if custom_key.strip() else env_api_key
    else:
        st.warning("⚠️ No API Key found in `.env`")
        active_api_key = st.text_input("Enter Gemini API Key", type="password", help="Get a free key from Google AI Studio (aistudio.google.com)")

    # Set in environment for this runtime session if provided
    if active_api_key:
        os.environ["GEMINI_API_KEY"] = active_api_key

    # Model Configuration
    st.subheader("2. AI Model Selection")
    default_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    model_choices = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash", "Custom"]
    
    selected_model_option = st.selectbox(
        "Gemini Model",
        options=model_choices,
        index=0 if default_model not in model_choices else model_choices.index(default_model),
        help="Configurable LLM checkpoint. gemini-2.5-flash is fast, accurate, and free-tier compatible."
    )
    
    if selected_model_option == "Custom":
        active_model = st.text_input("Custom Model Identifier", value="gemini-2.5-flash")
    else:
        active_model = selected_model_option

    st.markdown("---")
    st.subheader("📖 Quick Instructions")
    st.markdown("""
    1. **Choose Content Type:** Select Email or Message.
    2. **Select Purpose:** Pick a template or choose 'Custom'.
    3. **Provide Context:** Add real details (dates, courses, key requests).
    4. **Generate:** The AI will draft clean text without hallucinating facts.
    5. **Edit & Copy/Download:** Tweak in the output editor and export.
    """)

    st.markdown("---")
    st.markdown("**Tech Stack:** Python 3.10+, Streamlit, Google GenAI SDK (`google-genai`), python-dotenv.")

# Main Application Header
st.markdown('<div class="badge-pill">Powered by Google Gemini Generative AI</div>', unsafe_allow_html=True)
st.markdown('<div class="main-title">AI Email & Message Generator</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Generate personalized, polite, and context-aware communications for college, work, and personal needs in seconds.</div>', unsafe_allow_html=True)

# Form Section
col1, col2 = st.columns([1, 1], gap="large")

with col1:
    st.subheader("📝 Input Parameters")
    
    # Content Type Radio
    content_type = st.radio(
        "Select Content Type *",
        options=["Email", "WhatsApp / General Message"],
        horizontal=True,
        help="Emails include subject line, salutation, paragraphs, and sign-off. Messages are crisp and suited for messaging apps."
    )
    
    # Predefined Purposes based on type
    if content_type == "Email":
        email_purposes = [
            "Leave application",
            "Assignment extension request",
            "Internship application",
            "Job application",
            "Meeting request",
            "Thank-you email",
            "Complaint email",
            "Follow-up email",
            "Custom purpose"
        ]
        selected_purpose_option = st.selectbox("Purpose / Category *", options=email_purposes)
        
        if selected_purpose_option == "Custom purpose":
            purpose = st.text_input("Specify Custom Purpose *", placeholder="e.g., Request for laboratory access after hours")
        else:
            purpose = selected_purpose_option
    else:
        message_purposes = [
            "Birthday wishes",
            "Thank-you message",
            "Apology message",
            "Congratulations",
            "Formal message",
            "Friendly message",
            "Custom purpose"
        ]
        selected_purpose_option = st.selectbox("Message Category *", options=message_purposes)
        
        if selected_purpose_option == "Custom purpose":
            purpose = st.text_input("Specify Custom Purpose *", placeholder="e.g., Coordinating project submission with group mate")
        else:
            purpose = selected_purpose_option

    # Recipient & Sender
    r_col, s_col = st.columns(2)
    with r_col:
        recipient = st.text_input(
            "Recipient Name or Role *",
            placeholder="e.g., Dr. Sharma (HOD) or Hiring Manager",
            help="Who will receive this communication?"
        )
    with s_col:
        sender = st.text_input(
            "Your Name (Optional)",
            placeholder="e.g., Rohan Verma",
            help="Your name for the sign-off."
        )

    # Context & Important details
    context = st.text_area(
        "Context & Important Details *",
        placeholder="Provide the key facts. Examples:\n- Reason for leave: Viral fever with doctor advised 3 days rest\n- Dates: Oct 29 to Oct 31\n- Attached: Medical certificate\n- Pending tasks: Rohan will cover team presentation",
        height=140,
        help="Be as specific as possible. The AI is instructed NEVER to invent fake dates or facts."
    )

    # Tone, Length, Language
    opt_col1, opt_col2, opt_col3 = st.columns(3)
    with opt_col1:
        tone = st.selectbox("Tone", options=["Formal", "Professional", "Friendly", "Casual"], index=0)
    with opt_col2:
        length = st.selectbox("Length", options=["Short", "Medium", "Detailed"], index=1)
    with opt_col3:
        language = st.selectbox("Language", options=["English", "Hindi", "Hinglish"], index=0)

    # Action Buttons
    btn_col1, btn_col2 = st.columns([1, 1])
    with btn_col1:
        generate_clicked = st.button("✨ Generate Content", type="primary", use_container_width=True)
    with btn_col2:
        reset_clicked = st.button("🔄 Reset Inputs", use_container_width=True)

    if reset_clicked:
        st.session_state.generated_output = ""
        st.session_state.last_prompt_details = {}
        st.rerun()

# Generation Handler
if generate_clicked:
    # Validation
    validation_errors = []
    if not recipient.strip():
        validation_errors.append("Recipient name or role is required.")
    if not purpose.strip():
        validation_errors.append("Purpose is required.")
    if not context.strip():
        validation_errors.append("Context and details are required to generate an accurate communication.")
    
    if validation_errors:
        for err in validation_errors:
            st.error(f"⚠️ {err}")
    else:
        with st.spinner("🤖 Google Gemini is crafting your personalized content..."):
            result, error_msg = generate_content(
                content_type="email" if content_type == "Email" else "message",
                purpose=purpose,
                recipient=recipient,
                sender=sender,
                context=context,
                tone=tone,
                length=length,
                language=language,
                custom_model=active_model
            )

            if error_msg:
                st.error(f"❌ {error_msg}")
            else:
                st.session_state.generated_output = result
                st.session_state.last_prompt_details = {
                    "content_type": "email" if content_type == "Email" else "message",
                    "purpose": purpose,
                    "recipient": recipient,
                    "sender": sender,
                    "context": context,
                    "tone": tone,
                    "length": length,
                    "language": language,
                    "model": active_model
                }
                st.success("🎉 Content successfully generated!")

# Output Section
with col2:
    st.subheader("📄 Generated Output")
    
    if st.session_state.generated_output:
        # User Editable Text Area
        edited_output = st.text_area(
            "Review and edit your text before sharing:",
            value=st.session_state.generated_output,
            height=280,
            key="output_editor"
        )
        # Keep session state updated with edits
        st.session_state.generated_output = edited_output

        # Action bar for output
        act_col1, act_col2, act_col3 = st.columns(3)
        
        with act_col1:
            # Download button
            file_name = f"{'email' if 'Email' in content_type else 'message'}_{tone.lower()}.txt"
            st.download_button(
                label="📥 Download TXT",
                data=edited_output,
                file_name=file_name,
                mime="text/plain",
                use_container_width=True
            )

        with act_col2:
            # Regenerate button
            if st.button("🔁 Regenerate", use_container_width=True):
                if st.session_state.last_prompt_details:
                    with st.spinner("Generating fresh variation..."):
                        p = st.session_state.last_prompt_details
                        # Slight temperature / prompt nudge
                        re_result, re_error = generate_content(
                            content_type=p["content_type"],
                            purpose=p["purpose"],
                            recipient=p["recipient"],
                            sender=p["sender"],
                            context=p["context"] + "\n[Note: Provide a fresh creative variation with slightly different phrasing]",
                            tone=p["tone"],
                            length=p["length"],
                            language=p["language"],
                            custom_model=p.get("model", active_model)
                        )
                        if re_error:
                            st.error(re_error)
                        else:
                            st.session_state.generated_output = re_result
                            st.rerun()
                else:
                    st.warning("Please click 'Generate Content' first.")

        with act_col3:
            # Clear output
            if st.button("🗑️ Clear Output", use_container_width=True):
                st.session_state.generated_output = ""
                st.rerun()

        # Word count & Character count stats
        words = len(edited_output.split())
        chars = len(edited_output)
        st.caption(f"📊 Stats: **{words}** words | **{chars}** characters | Language: **{language}** | Tone: **{tone}**")

    else:
        st.info("👈 Fill out the input parameters on the left and click **'Generate Content'** to preview your AI-crafted email or message here.")
        
        # Beginner demo card
        with st.expander("💡 Example Input & Output Demo (Click to see)", expanded=False):
            st.markdown("""
            **Sample Scenario:** Leave application for illness
            - **Type:** Email
            - **Recipient:** Dr. Ramesh (Class Coordinator)
            - **Purpose:** Leave application
            - **Context:** Suffering from severe migraine, doctor recommended 2 days rest (Oct 29-30). Attached medical slip. Will catch up on lab records with roll 42.
            - **Tone:** Formal | **Length:** Medium | **Language:** English
            
            **Output Preview:**
            > **Subject:** Leave Application: 2 Days Medical Leave (Oct 29 - Oct 30) - [Roll No.]  
            >  
            > Respected Dr. Ramesh,  
            >  
            > I am writing to respectfully request medical leave for two days, from October 29 to October 30, due to severe migraine. The doctor has advised complete bed rest, and I have attached the medical prescription for your reference.  
            >  
            > I have spoken with my classmate (Roll No. 42) to stay updated on the laboratory experiments during my absence.  
            >  
            > Thank you for your kind consideration.  
            >  
            > Sincerely,  
            > [Your Name]
            """)

# Footer for College Mini-Project
st.markdown("""
<div class="footer-note">
    <strong>AI-Powered Email and Message Generator</strong> — Final Year / College Mini-Project<br>
    Built with <strong>Python</strong>, <strong>Streamlit</strong>, and the <strong>Google Gemini API (google-genai SDK)</strong>.<br>
    <em>Generative AI LLM Architecture without Custom Training Overhead</em>
</div>
""", unsafe_allow_html=True)
