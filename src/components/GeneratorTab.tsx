import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Download, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Send, 
  FileText, 
  MessageSquare, 
  Info,
  Layers,
  Wand2,
  Mail
} from 'lucide-react';
import { ContentType, ToneType, LengthType, LanguageType, GenerationParams } from '../types';
import { PRESET_TEMPLATES } from '../data/projectData';

const EMAIL_PURPOSES = [
  'Leave application',
  'Assignment extension request',
  'Internship application',
  'Job application',
  'Meeting request',
  'Thank-you email',
  'Complaint email',
  'Follow-up email',
  'Custom purpose',
];

const MESSAGE_PURPOSES = [
  'Birthday wishes',
  'Thank-you message',
  'Apology message',
  'Congratulations',
  'Formal message',
  'Friendly message',
  'Custom purpose',
];

export const GeneratorTab: React.FC = () => {
  // Form State
  const [contentType, setContentType] = useState<ContentType>('email');
  const [selectedPurposeOption, setSelectedPurposeOption] = useState<string>('Assignment extension request');
  const [customPurpose, setCustomPurpose] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('Prof. Sharma (Machine Learning Instructor)');
  const [sender, setSender] = useState<string>('Aarav Mehta (Roll No. 21CS045)');
  const [context, setContext] = useState<string>(
    'Requesting a 3-day extension for the ML Mini-Project Assignment #3 due to viral fever. Doctor advised bed rest. Attached medical certificate. Preprocessing and EDA already completed.'
  );
  const [tone, setTone] = useState<ToneType>('Formal');
  const [length, setLength] = useState<LengthType>('Medium');
  const [language, setLanguage] = useState<LanguageType>('English');

  // Output & Execution State
  const [generatedText, setGeneratedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [wordCount, setWordCount] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);

  // Active purpose value
  const activePurpose = selectedPurposeOption === 'Custom purpose' ? customPurpose : selectedPurposeOption;

  // Handle Preset Loading
  const loadPreset = (presetIndex: number) => {
    const p = PRESET_TEMPLATES[presetIndex];
    if (!p) return;
    setContentType(p.contentType);
    if (p.contentType === 'email') {
      setSelectedPurposeOption(EMAIL_PURPOSES.includes(p.purpose) ? p.purpose : 'Custom purpose');
    } else {
      setSelectedPurposeOption(MESSAGE_PURPOSES.includes(p.purpose) ? p.purpose : 'Custom purpose');
    }
    if (!EMAIL_PURPOSES.includes(p.purpose) && !MESSAGE_PURPOSES.includes(p.purpose)) {
      setCustomPurpose(p.purpose);
    }
    setRecipient(p.recipient);
    setSender(p.sender);
    setContext(p.context);
    setTone(p.tone);
    setLength(p.length);
    setLanguage(p.language);
    setErrorMsg(null);
  };

  // Generation Request
  const handleGenerate = async (isRegenerate: boolean = false) => {
    setErrorMsg(null);

    // Validation
    if (!recipient.trim()) {
      setErrorMsg('Recipient name or role is required. Please specify who this communication is addressed to.');
      return;
    }
    if (!activePurpose.trim()) {
      setErrorMsg('Purpose is required. Please select a category or write a custom purpose.');
      return;
    }
    if (!context.trim()) {
      setErrorMsg('Context and key details are required so the AI does not have to invent facts.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType,
          purpose: activePurpose,
          recipient: recipient.trim(),
          sender: sender.trim(),
          context: context.trim(),
          tone,
          length,
          language,
          isRegenerate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content. Please try again.');
      }

      setGeneratedText(data.result);
      setWordCount(data.wordCount || data.result.split(/\s+/).filter(Boolean).length);
      setCharCount(data.charCount || data.result.length);
    } catch (err: any) {
      console.error('Generation failed:', err);
      setErrorMsg(err.message || 'An unexpected network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to Clipboard
  const handleCopy = async () => {
    if (!generatedText) return;
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  // Download as .TXT file
  const handleDownload = () => {
    if (!generatedText) return;
    const blob = new Blob([generatedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${contentType}_${tone.toLowerCase()}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset form
  const handleReset = () => {
    setRecipient('');
    setSender('');
    setContext('');
    setCustomPurpose('');
    setGeneratedText('');
    setErrorMsg(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Quick Load Scenario Templates */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">
              Quick-Load Scenarios (1-Click Presets):
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Click any chip to autofill sample inputs</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadPreset(idx)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 hover:border-indigo-200 transition-colors"
            >
              <span>{tmpl.title}</span>
              <span className="text-[10px] bg-slate-200/70 hover:bg-indigo-100 text-slate-600 px-1.5 py-0.5 rounded">
                {tmpl.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form on Left, Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form: 6 columns on lg */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Input Parameters</h2>
            </div>
            <span className="text-xs font-medium text-slate-500">* Required fields</span>
          </div>

          {/* Content Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              1. Content Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setContentType('email');
                  setSelectedPurposeOption(EMAIL_PURPOSES[0]);
                }}
                className={`flex items-center justify-center space-x-2.5 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  contentType === 'email'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Mail className="w-4 h-4 text-indigo-600" />
                <span>Formal Email</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setContentType('message');
                  setSelectedPurposeOption(MESSAGE_PURPOSES[0]);
                }}
                className={`flex items-center justify-center space-x-2.5 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  contentType === 'message'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>WhatsApp / Message</span>
              </button>
            </div>
          </div>

          {/* Purpose Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              2. Purpose / Category *
            </label>
            <select
              value={selectedPurposeOption}
              onChange={(e) => setSelectedPurposeOption(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            >
              {(contentType === 'email' ? EMAIL_PURPOSES : MESSAGE_PURPOSES).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {selectedPurposeOption === 'Custom purpose' && (
              <input
                type="text"
                placeholder="Specify your custom purpose (e.g., Request for laboratory access after hours)"
                value={customPurpose}
                onChange={(e) => setCustomPurpose(e.target.value)}
                className="mt-2.5 w-full px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50/30 text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 placeholder:text-slate-400"
              />
            )}
          </div>

          {/* Recipient & Sender Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Recipient Name / Role *
              </label>
              <input
                type="text"
                placeholder="e.g., Dr. Sharma (HOD) or Hiring Manager"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Sender Name <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Rohan Verma"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Context & Key Details */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Context & Important Details *
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Be specific with dates, reasons</span>
            </div>
            <textarea
              rows={4}
              placeholder="Provide the key facts so Gemini doesn't invent them. Examples:&#10;- Medical leave: Viral fever, doctor advised 3 days rest (Oct 29-31)&#10;- Attached: Doctor prescription slip&#10;- Plan: Rohan will share class notes"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 placeholder:text-slate-400 leading-relaxed font-sans"
            />
            <div className="flex items-center space-x-1.5 mt-1 text-[11px] text-slate-500">
              <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Prompt guardrail active: AI will not invent personal dates, companies, or events.</span>
            </div>
          </div>

          {/* Tone, Length, Language Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as ToneType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                <option value="Formal">Formal</option>
                <option value="Professional">Professional</option>
                <option value="Friendly">Friendly</option>
                <option value="Casual">Casual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Length
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as LengthType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                <option value="Short">Short (~60w)</option>
                <option value="Medium">Medium (~120w)</option>
                <option value="Detailed">Detailed (~240w)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to generate:</p>
                <p className="text-xs text-rose-700 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleGenerate(false)}
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-sm shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Content</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Right Output: 6 columns on lg */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col min-h-[580px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Generated Output</h2>
            </div>
            {generatedText && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Ready & Editable
              </span>
            )}
          </div>

          {generatedText ? (
            <div className="flex-1 flex flex-col space-y-4">
              
              {/* Output Editor Header Stats */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600">
                <div className="flex items-center space-x-3">
                  <span>Type: <strong className="text-slate-800 capitalize">{contentType}</strong></span>
                  <span>Tone: <strong className="text-slate-800">{tone}</strong></span>
                  <span>Lang: <strong className="text-slate-800">{language}</strong></span>
                </div>
                <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-500">
                  <span>{wordCount} words</span>
                  <span>•</span>
                  <span>{charCount} chars</span>
                </div>
              </div>

              {/* Editable Output Textarea */}
              <div className="relative flex-1">
                <textarea
                  value={generatedText}
                  onChange={(e) => {
                    setGeneratedText(e.target.value);
                    setWordCount(e.target.value.split(/\s+/).filter(Boolean).length);
                    setCharCount(e.target.value.length);
                  }}
                  className="w-full h-80 sm:h-96 p-4 rounded-xl border border-slate-200 text-slate-800 text-sm leading-relaxed font-sans bg-slate-50/30 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-y"
                  placeholder="Generated text will appear here..."
                />
              </div>

              {/* Action Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    copied
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleGenerate(true)}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .TXT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGeneratedText('')}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-3 shadow-xs">
                <Send className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Your AI-generated draft will appear here</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                Choose a quick preset or fill out the parameters on the left and click <strong>&quot;Generate Content&quot;</strong>. You can review, edit, copy, and download the output.
              </p>
              <div className="mt-5 p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100/80 text-left text-xs text-slate-600 max-w-sm">
                <p className="font-semibold text-indigo-900 mb-1 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> Key Capabilities:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                  <li>Structured Email format (Subject line, Greeting, Body, Sign-off)</li>
                  <li>WhatsApp &amp; SMS direct message formatting</li>
                  <li>Factual guardrails (preserves provided facts, uses placeholders for missing info)</li>
                  <li>Multilingual generation (English, Hindi, Hinglish)</li>
                </ul>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
