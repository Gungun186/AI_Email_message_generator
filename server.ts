import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize server-side Gemini client per skill instructions
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface GenerateRequestBody {
  contentType: 'email' | 'message';
  purpose: string;
  recipient: string;
  sender?: string;
  context: string;
  tone: 'Formal' | 'Professional' | 'Friendly' | 'Casual';
  length: 'Short' | 'Medium' | 'Detailed';
  language: 'English' | 'Hindi' | 'Hinglish';
  isRegenerate?: boolean;
}

// Prompt Construction
function constructPrompt(body: GenerateRequestBody): string {
  const { contentType, purpose, recipient, sender, context, tone, length, language, isRegenerate } = body;

  const senderText = sender && sender.trim() ? `Sender Name: '${sender.trim()}'` : `Sender Name: Not provided (leave standard placeholder like '[Your Name]')`;

  const lengthGuides: Record<string, string> = {
    Short: 'Brief, concise, and straight to the point (around 50-80 words). Avoid unnecessary filler.',
    Medium: 'Balanced length with polite opening, clear main body paragraphs, and professional closing (around 100-170 words).',
    Detailed: 'Thorough and comprehensive, covering all context, background explanations, timelines, and next steps (around 200-300 words).'
  };

  const languageGuides: Record<string, string> = {
    English: 'Write entirely in natural, fluent English with impeccable grammar.',
    Hindi: 'Write in natural, respectful Hindi using Devanagari script.',
    Hinglish: 'Write in natural conversational Hinglish (Hindi written in Latin/English alphabet letters, as commonly typed in WhatsApp/SMS).'
  };

  const formatRules = contentType === 'email'
    ? `
OUTPUT FORMAT RULES:
- Start strictly with: Subject: <Clear, concise, high-impact subject line>
- Blank line.
- Salutation / Greeting tailored to the recipient (${recipient}) and tone.
- Well-structured body paragraphs with standard paragraph breaks.
- Appropriate professional closing / sign-off.
- Sender signature (${sender ? sender : '[Your Name]'}).
- Do NOT wrap in triple backticks or markdown code blocks (e.g. no \`\`\`markdown). Return clean formatted text directly.
`
    : `
OUTPUT FORMAT RULES:
- A direct, natural message suitable for WhatsApp, SMS, or Slack/Teams.
- Do NOT include a 'Subject:' line.
- Use natural greeting and sign-off.
- If tone is 'Friendly' or 'Casual', include tasteful, appropriate emojis.
- If tone is 'Formal' or 'Professional', keep it polite, crisp, and avoid excessive emojis.
- Do NOT wrap in triple backticks or markdown code blocks.
`;

  return `You are an expert communication specialist and writing mentor.
Your task is to draft a personalized ${contentType.toUpperCase()} tailored specifically to the user's requirements.

### STRICT GUARDRAILS & ANTI-HALLUCINATION RULES:
1. STRICT FACTUALITY: Do NOT invent, assume, or hallucinate personal details, specific past events, fake dates, phone numbers, addresses, or university/company names that the user did not provide.
2. If any necessary specific detail (such as a date, roll number, or meeting time) is missing, use clear bracketed placeholders like [Date], [Time], [Course Name], or [Document Name] so the user can easily fill it in.
3. Match the specified tone strictly: ${tone}.
4. Adhere to the requested length: ${length} (${lengthGuides[length] || lengthGuides['Medium']}).
5. Target Language: ${language} (${languageGuides[language] || languageGuides['English']}).
${isRegenerate ? '6. VARIATION NOTE: Provide a fresh creative variation with alternative phrasing and structure while strictly preserving the facts.\n' : ''}

### Input Parameters:
- Content Type: ${contentType}
- Stated Purpose: ${purpose}
- Recipient: ${recipient}
- ${senderText}
- User Context & Key Facts:
${context}

${formatRules}
`.trim();
}

// POST endpoint for text generation
app.post('/api/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { contentType, purpose, recipient, sender, context, tone, length, language, isRegenerate } = req.body as GenerateRequestBody;

    // Validation
    if (!recipient || !recipient.trim()) {
      res.status(400).json({ error: 'Recipient name or role is required.' });
      return;
    }
    if (!purpose || !purpose.trim()) {
      res.status(400).json({ error: 'Purpose is required.' });
      return;
    }
    if (!context || !context.trim()) {
      res.status(400).json({ error: 'Context and key details are required to generate an accurate communication.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check your environment variables.'
      });
      return;
    }

    const prompt = constructPrompt({
      contentType: contentType || 'email',
      purpose: purpose.trim(),
      recipient: recipient.trim(),
      sender: sender ? sender.trim() : '',
      context: context.trim(),
      tone: tone || 'Formal',
      length: length || 'Medium',
      language: language || 'English',
      isRegenerate: Boolean(isRegenerate)
    });

    // Call Gemini API server-side using fast, high-availability model
    const primaryModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    let response;
    try {
      response = await ai.models.generateContent({
        model: primaryModel,
        contents: prompt,
      });
    } catch (primaryErr: any) {
      const pMsg = primaryErr?.message || '';
      console.warn(`Primary model ${primaryModel} failed (${pMsg}), attempting fallback...`);
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
        });
      } catch (fallbackErr: any) {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });
      }
    }

    const generatedText = response.text?.trim() || '';

    if (!generatedText) {
      res.status(502).json({ error: 'The AI model returned an empty response. Please try again with additional context.' });
      return;
    }

    const wordCount = generatedText.split(/\s+/).filter(Boolean).length;
    const charCount = generatedText.length;

    res.json({
      result: generatedText,
      wordCount,
      charCount,
      modelUsed: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Error generating content with Gemini:', error);
    const errorMessage = error?.message || 'An unknown error occurred';

    if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429')) {
      res.status(429).json({ error: 'Gemini API quota or rate limit exceeded. Please wait a moment before trying again.' });
      return;
    }
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('403')) {
      res.status(403).json({ error: 'Invalid Gemini API key or permission denied. Please verify your API key in Google AI Studio.' });
      return;
    }
    res.status(500).json({ error: `Generation failed: ${errorMessage}` });
  }
});

// Setup Vite dev server or static serve
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
