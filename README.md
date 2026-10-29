# ✉️ AI-Powered Email & Message Generator Using Generative AI
> **Academic Level:** College Mini-Project / Final Year Engineering Prototype  
> **Domain:** Generative AI & Natural Language Processing (NLP)  
> **Core Stack:** Python 3.10+, Streamlit, Google Gemini API (`google-genai` SDK), python-dotenv

---

## 📌 1. Project Overview & Abstract

In contemporary academic and professional settings, drafting clear, context-aware, and polite correspondence (such as professor leave letters, assignment deadline extension requests, internship applications, or professional congratulations) is both time-consuming and prone to tonal mismatches. 

The **AI-Powered Email & Message Generator** is a lightweight, zero-database web application designed to solve this problem. Leveraging Google’s state-of-the-art **Gemini Large Language Models (LLMs)** via the official `google-genai` SDK, it converts concise bullet points or rough context into structured, polished emails or WhatsApp/chat messages tailored to the recipient, purpose, tone, language, and desired length.

### Key Highlights:
- **No Model Training Required:** Harnesses foundational pretrained LLMs via Google Gemini API zero-shot/few-shot prompting, eliminating the heavy cost and hardware needs of custom training.
- **Strict Anti-Hallucination Guardrails:** Prompt engineering constraints explicitly prevent the LLM from inventing fake dates, fake events, or fictitious qualifications.
- **Multi-Lingual Flexibility:** Drafts in English, Hindi (Devanagari), or modern conversational Hinglish.
- **Interactive Workflow:** Real-time editing, one-click copying, regeneration, and `.txt` file downloading.

---

## 🏗️ 2. Project Architecture & Data Flow

```
[ User Input (Browser / Streamlit) ]
  ├── Content Type (Email vs. Message)
  ├── Purpose & Recipient
  ├── User Context & Key Facts
  └── Tone, Length & Language
         │
         ▼
[ Prompt Engineering Engine (utils/ai_generator.py) ]
  ├── Formats System Guardrails (No hallucinated facts)
  ├── Structures Output Format (Subject, Greeting, Body, Sign-off)
  └── Injects User Details & Placeholders
         │
         ▼
[ Google Gemini API (`google-genai` Client) ]
  ├── Communicates securely over HTTPS
  └── Model: gemini-2.5-flash (configurable)
         │
         ▼
[ Output Processing & Streamlit Session State ]
  ├── Editable Text Area
  ├── One-Click Clipboard Copy
  ├── Fresh Variation Regeneration
  └── Instant .TXT File Export
```

---

## 📁 3. Project Directory Structure

```
AI_Email_Message_Generator/
├── app.py                   # Streamlit frontend & session state management
├── requirements.txt         # Python dependencies
├── .env.example             # Template for API key configuration
├── .env                     # Your private API key (never push to GitHub)
├── .gitignore               # Ignores .env and virtual environment files
├── README.md                # Comprehensive project documentation
├── VIVA_PREPARATION.md      # Viva presentation guide & 15+ Q&A
└── utils/
    ├── __init__.py          # Marks folder as a Python package
    └── ai_generator.py      # Prompt construction and Gemini API integration
```

---

## 🚀 4. How to Run on Windows (Step-by-Step with VS Code)

### Prerequisites:
- **Python 3.10 or higher** installed on Windows. (Check with `python --version` in terminal).
- A free **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).

### Step 1: Open Project in VS Code
1. Open Visual Studio Code.
2. Select **File > Open Folder...** and choose the `AI_Email_Message_Generator` folder.
3. Open a new terminal in VS Code (`Ctrl + ~` or **Terminal > New Terminal**).

### Step 2: Create a Virtual Environment
In the terminal, run:
```bash
# Create virtual environment named 'venv'
python -m venv venv

# Activate the virtual environment on Windows
.\venv\Scripts\activate
```
*(You will see `(venv)` appear at the start of your terminal command prompt).*

### Step 3: Install Required Libraries
```bash
pip install -r requirements.txt
```

### Step 4: Configure Your API Key
1. Copy `.env.example` and rename the new file to `.env`:
   ```bash
   copy .env.example .env
   ```
2. Open `.env` and paste your Google Gemini API key:
   ```ini
   GEMINI_API_KEY="AIzaSyYourActualKeyHere..."
   GEMINI_MODEL="gemini-2.5-flash"
   ```

### Step 5: Run the Streamlit Application
```bash
streamlit run app.py
```
Your default browser will automatically open:
```
Local URL: http://localhost:8501
Network URL: http://192.168.x.x:8501
```

---

## 🧪 5. Testing Checklist

| # | Test Scenario | Inputs | Expected Result |
|---|---|---|---|
| 1 | **Formal Assignment Extension** | Recipient: Dr. Sharma, Purpose: Assignment extension, Context: Lab fever, 2 days late, Tone: Formal | Generates professional email with clear subject, polite salutation, valid reasons, and sign-off. |
| 2 | **Internship Application** | Recipient: HR Tech Corp, Purpose: Internship, Context: React & Python skills, Tone: Professional | Generates structured cover letter email without inventing fake degrees. |
| 3 | **Friendly Birthday Message** | Recipient: Priya, Purpose: Birthday wishes, Context: Childhood friend, Tone: Friendly | Produces warm message with tasteful emojis; no email subject line. |
| 4 | **Hindi / Hinglish Message** | Recipient: Aman, Purpose: Apology, Context: Missed group call, Language: Hinglish | Generates natural, fluent Hinglish conversational text. |
| 5 | **Missing Required Input** | Leave Recipient blank, click Generate | Displays validation error: "Recipient name or role is required." |
| 6 | **Regenerate Output** | Click 'Regenerate' on existing output | Fetches a fresh variation with different phrasing while keeping facts. |
| 7 | **Edit & Export** | Modify generated text in output box and click Download | Downloads `.txt` file containing the updated modified text. |
| 8 | **Invalid API Key** | Enter incorrect key in sidebar | Displays friendly alert: "Invalid Gemini API key or insufficient permissions." |
| 9 | **Rate Limit Handling** | Rapid successive queries exceeding quota | Gracefully shows 429 quota alert instead of crashing. |
| 10 | **State Preservation** | Change sidebar settings after generation | Output remains intact inside `st.session_state`. |

---

## 💡 6. College Viva Quick Highlights

- **Why Gemini API instead of training?**  
  Pretrained LLMs like Gemini already have deep semantic comprehension of language, grammar, and nuance across 100+ languages. Training an LLM from scratch requires petabytes of data, thousands of GPUs, and millions in funding. Using the API via Prompt Engineering achieves production-quality results in seconds with zero infrastructure cost.
- **How is hallucination prevented?**  
  The system prompt enforces strict constraints forbidding the model from inventing dates, achievements, or facts not explicitly provided by the user. If information is missing, placeholders like `[Date]` or `[Your Roll No.]` are generated.

*(See `VIVA_PREPARATION.md` for 15+ detailed question & answer pairs!)*
