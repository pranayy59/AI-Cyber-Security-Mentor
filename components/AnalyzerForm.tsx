"use client";

import { useState } from "react";
import { EyeOff, LoaderCircle, SearchCheck } from "lucide-react";
import { ExampleMessages } from "@/components/ExampleMessages";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ResultCard } from "@/components/ResultCard";
import type { AnalysisResponse, Language } from "@/types/analysis";

const UI = {
  en: {
    label: "Message, email or link",
    placeholder: "Paste an SMS, email, WhatsApp message or suspicious link here...",
    button: "Check Safety",
    loading: "Analyzing...",
    loadingDetail: "Analyzing suspicious patterns...",
    empty: "Please paste a message, email or link first.",
    tooLong: "Message must be 8,000 characters or fewer.",
    generic: "We couldn't complete the analysis. Please try again.",
    privacy: "Your text is analyzed only for this request and is not stored by this app.",
  },
  hi: {
    label: "संदेश, ईमेल या लिंक",
    placeholder: "SMS, ईमेल, WhatsApp संदेश या संदिग्ध लिंक यहां पेस्ट करें...",
    button: "सुरक्षा जांचें",
    loading: "जांच हो रही है...",
    loadingDetail: "संदिग्ध पैटर्न की जांच हो रही है...",
    empty: "कृपया पहले कोई संदेश, ईमेल या लिंक पेस्ट करें।",
    tooLong: "संदेश 8,000 अक्षरों या उससे कम का होना चाहिए।",
    generic: "हम विश्लेषण पूरा नहीं कर सके। कृपया फिर से कोशिश करें।",
    privacy: "आपके टेक्स्ट का उपयोग केवल इस जांच के लिए होता है और यह ऐप उसे स्टोर नहीं करता।",
  },
} as const;

export function AnalyzerForm() {
  const [language, setLanguage] = useState<Language>("en");
  const [content, setContent] = useState("");
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const copy = UI[language];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const trimmed = content.trim();
    if (trimmed.length < 3) { setError(copy.empty); return; }
    if (trimmed.length > 8_000) { setError(copy.tooLong); return; }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed, language }),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        const apiError = typeof data === "object" && data && "error" in data ? String(data.error) : copy.generic;
        throw new Error(apiError);
      }
      setResult(data as AnalysisResponse);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.generic);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-700/80 bg-slate-900/90 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-7" noValidate>
        <div className="flex items-end justify-between gap-4">
          <LanguageSelector value={language} onChange={(next) => { setLanguage(next); setError(null); }} disabled={loading} />
          <span className={`text-xs tabular-nums ${content.length > 8_000 ? "font-semibold text-red-400" : "text-slate-400"}`}>
            {content.length.toLocaleString()}/8,000
          </span>
        </div>

        <label htmlFor="content" className="mt-6 block text-sm font-semibold text-slate-200">{copy.label}</label>
        <textarea
          id="content"
          name="content"
          value={content}
          disabled={loading}
          onChange={(event) => { setContent(event.target.value); if (error) setError(null); }}
          placeholder={copy.placeholder}
          rows={8}
          maxLength={8_100}
          aria-describedby={error ? "form-error" : "privacy-note"}
          aria-invalid={Boolean(error)}
          className="mt-2 w-full resize-y rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-4 text-base leading-7 text-slate-100 outline-none transition placeholder:text-slate-500 hover:border-slate-600 focus:border-blue-500 focus:bg-slate-950 focus:ring-4 focus:ring-blue-900/50 disabled:cursor-not-allowed disabled:opacity-70"
        />

        {error && <div id="form-error" role="alert" className="mt-3 rounded-xl border border-red-900/70 bg-red-950/40 px-4 py-3 text-sm font-medium text-red-300">{error}</div>}

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p id="privacy-note" className="flex max-w-md items-start gap-2 text-xs leading-5 text-slate-400">
            <EyeOff className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {copy.privacy}
          </p>
          <button type="submit" disabled={loading} className="primary-button">
            {loading ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /> : <SearchCheck className="h-5 w-5" aria-hidden="true" />}
            {loading ? copy.loading : copy.button}
          </button>
        </div>
        {loading && <p className="mt-4 text-center text-sm font-medium text-blue-300" role="status">{copy.loadingDetail}</p>}
        <ExampleMessages language={language} onSelect={(value) => { setContent(value); setError(null); }} disabled={loading} />
      </form>
      {result && <ResultCard result={result} language={language} />}
    </>
  );
}
