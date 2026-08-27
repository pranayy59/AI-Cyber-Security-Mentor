"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { EyeOff, ImagePlus, LoaderCircle, SearchCheck, X } from "lucide-react";
import { ExampleMessages } from "@/components/ExampleMessages";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ResultCard } from "@/components/ResultCard";
import type { AnalysisResponse, Language } from "@/types/analysis";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface SelectedImage {
  base64: string;
  mimeType: string;
  name: string;
  preview: string;
}

const UI = {
  en: {
    label: "Message, email or link",
    placeholder: "Paste an SMS, email, WhatsApp message or suspicious link here...",
    button: "Check Safety",
    loading: "Analyzing...",
    loadingDetail: "Analyzing suspicious patterns...",
    empty: "Please paste a message, email or link, or upload a screenshot first.",
    tooLong: "Message must be 8,000 characters or fewer.",
    generic: "We couldn't complete the analysis. Please try again.",
    privacy: "Your text is analyzed only for this request and is not stored by this app.",
    imageOption: "Or upload a screenshot",
    imageHint: "JPEG, PNG or WebP, up to 4 MB.",
    chooseImage: "Choose image",
    removeImage: "Remove image",
    imagePrivacy: "Your screenshot is sent only for this analysis and is not stored by this app.",
    invalidImage: "Please choose a JPEG, PNG or WebP image.",
    imageTooLarge: "Image must be 4 MB or smaller.",
    imageReadError: "We couldn't read that image. Please choose another file.",
    imagePreviewAlt: "Selected screenshot preview",
  },
  hi: {
    label: "संदेश, ईमेल या लिंक",
    placeholder: "SMS, ईमेल, WhatsApp संदेश या संदिग्ध लिंक यहां पेस्ट करें...",
    button: "सुरक्षा जांचें",
    loading: "जांच हो रही है...",
    loadingDetail: "संदिग्ध पैटर्न की जांच हो रही है...",
    empty: "कृपया कोई संदेश, ईमेल या लिंक पेस्ट करें या स्क्रीनशॉट अपलोड करें।",
    tooLong: "संदेश 8,000 अक्षरों या उससे कम का होना चाहिए।",
    generic: "हम विश्लेषण पूरा नहीं कर सके। कृपया फिर से कोशिश करें।",
    privacy: "आपके टेक्स्ट का उपयोग केवल इस जांच के लिए होता है और यह ऐप उसे स्टोर नहीं करता।",
    imageOption: "या स्क्रीनशॉट अपलोड करें",
    imageHint: "JPEG, PNG या WebP, अधिकतम 4 MB।",
    chooseImage: "चित्र चुनें",
    removeImage: "चित्र हटाएं",
    imagePrivacy: "आपका स्क्रीनशॉट केवल इस जांच के लिए भेजा जाता है और यह ऐप उसे स्टोर नहीं करता।",
    invalidImage: "कृपया JPEG, PNG या WebP चित्र चुनें।",
    imageTooLarge: "चित्र 4 MB या उससे छोटा होना चाहिए।",
    imageReadError: "हम इस चित्र को पढ़ नहीं सके। कृपया दूसरा चित्र चुनें।",
    imagePreviewAlt: "चुने गए स्क्रीनशॉट का पूर्वावलोकन",
  },
} as const;

export function AnalyzerForm() {
  const [language, setLanguage] = useState<Language>("en");
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const copy = UI[language];

  function clearImage() {
    setSelectedImage(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
      setSelectedImage(null);
      event.target.value = "";
      setError(copy.invalidImage);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setSelectedImage(null);
      event.target.value = "";
      setError(copy.imageTooLarge);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setError(copy.imageReadError);
        return;
      }
      const separatorIndex = reader.result.indexOf(",");
      if (separatorIndex < 0) {
        setError(copy.imageReadError);
        return;
      }
      setSelectedImage({
        base64: reader.result.slice(separatorIndex + 1),
        mimeType: file.type,
        name: file.name,
        preview: reader.result,
      });
    };
    reader.onerror = () => {
      setSelectedImage(null);
      event.target.value = "";
      setError(copy.imageReadError);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const trimmed = content.trim();
    if (!selectedImage && trimmed.length < 3) { setError(copy.empty); return; }
    if (!selectedImage && trimmed.length > 8_000) { setError(copy.tooLong); return; }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedImage
          ? { image: selectedImage.base64, imageMimeType: selectedImage.mimeType, language }
          : { content: trimmed, language }),
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

        <div className="mt-3 rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-200">{copy.imageOption}</p>
              <p className="mt-1 text-xs text-slate-400">{copy.imageHint}</p>
            </div>
            <label className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition ${loading ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-blue-700 hover:bg-blue-950/50 hover:text-blue-300"}`}>
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
              {copy.chooseImage}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                disabled={loading}
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>
          </div>
          <p id="image-privacy-note" className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-400">
            <EyeOff className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {copy.imagePrivacy}
          </p>
          {selectedImage && (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-800/70 p-3">
              <Image
                src={selectedImage.preview}
                alt={copy.imagePreviewAlt}
                width={64}
                height={64}
                unoptimized
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-300">{selectedImage.name}</p>
              <button
                type="button"
                onClick={clearImage}
                disabled={loading}
                aria-label={copy.removeImage}
                title={copy.removeImage}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

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
        <ExampleMessages language={language} onSelect={(value) => { setContent(value); clearImage(); setError(null); }} disabled={loading} />
      </form>
      {loading && (
        <section className="mt-7 animate-pulse" aria-hidden="true">
          <div className="min-h-72 rounded-3xl border border-slate-700/80 bg-slate-900 p-6 shadow-xl shadow-black/30 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="h-3 w-24 rounded-full bg-slate-800" />
                <div className="h-8 w-36 rounded-full bg-slate-800" />
              </div>
              <div className="h-10 w-20 rounded-xl bg-slate-800" />
            </div>
            <div className="mt-6 h-2 rounded-full bg-slate-800" />
            <div className="mt-7 space-y-3">
              <div className="h-5 w-full rounded bg-slate-800" />
              <div className="h-5 w-3/4 rounded bg-slate-800" />
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="h-28 rounded-2xl bg-slate-800/70" />
              <div className="h-28 rounded-2xl bg-slate-800/70" />
            </div>
          </div>
        </section>
      )}
      {result && <ResultCard result={result} language={language} />}
    </>
  );
}
