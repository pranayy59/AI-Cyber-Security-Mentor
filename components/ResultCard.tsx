"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Flag,
  Gift,
  Info,
  KeyRound,
  Landmark,
  Package,
  ShieldCheck,
  Smartphone,
  Tags,
} from "lucide-react";
import { ActionCard } from "@/components/ActionCard";
import { RiskBadge } from "@/components/RiskBadge";
import type { AnalysisResponse, Language, RiskLevel } from "@/types/analysis";

const scoreColor: Record<RiskLevel, string> = {
  SAFE: "text-emerald-600",
  SUSPICIOUS: "text-amber-600",
  DANGEROUS: "text-red-600",
};

const barColor: Record<RiskLevel, string> = {
  SAFE: "bg-emerald-500",
  SUSPICIOUS: "bg-amber-500",
  DANGEROUS: "bg-red-500",
};

function getCategoryIcon(category: string) {
  const normalized = category.toLocaleLowerCase();
  const iconClassName = "h-4 w-4 shrink-0 text-slate-600";

  if (normalized === "none" || normalized.includes("कोई नहीं")) return <ShieldCheck className={iconClassName} aria-hidden="true" />;
  if (/\b(?:bank|kyc)\b|बैंक|केवाईसी|खाता/i.test(normalized)) return <Landmark className={iconClassName} aria-hidden="true" />;
  if (/\b(?:lottery|prize|reward|winner)\b|लॉटरी|इनाम|पुरस्कार/i.test(normalized)) return <Gift className={iconClassName} aria-hidden="true" />;
  if (/\b(?:delivery|parcel|shipping|courier)\b|डिलीवरी|पार्सल|शिपिंग|कूरियर/i.test(normalized)) return <Package className={iconClassName} aria-hidden="true" />;
  if (/\b(?:job|employment|work)\b|नौकरी|रोजगार|काम/i.test(normalized)) return <Briefcase className={iconClassName} aria-hidden="true" />;
  if (/\b(?:remote access|app install|apk|application install)\b|रिमोट|ऐप|एपीके/i.test(normalized)) return <Smartphone className={iconClassName} aria-hidden="true" />;
  if (/\b(?:phishing|credential|password|otp|pin)\b|फ़िशिंग|फिशिंग|गोपनीय|पासवर्ड|ओटीपी|पिन/i.test(normalized)) return <KeyRound className={iconClassName} aria-hidden="true" />;
  return <AlertTriangle className={iconClassName} aria-hidden="true" />;
}

export function ResultCard({ result, language }: { result: AnalysisResponse; language: Language }) {
  const hi = language === "hi";
  const [displayedScore, setDisplayedScore] = useState(0);

  useEffect(() => {
    const duration = 700;
    const startedAt = performance.now();
    let animationFrame = 0;

    const updateScore = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayedScore(Math.round(result.riskScore * easedProgress));

      if (progress < 1) animationFrame = requestAnimationFrame(updateScore);
    };

    animationFrame = requestAnimationFrame(updateScore);
    return () => cancelAnimationFrame(animationFrame);
  }, [result.riskScore]);

  return (
    <section className="animate-reveal mt-7" aria-live="polite" aria-label="Safety analysis result">
      <div className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 ${result.riskLevel === "DANGEROUS" ? "dangerous-card-pulse" : ""}`}>
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{hi ? "जोखिम परिणाम" : "Risk verdict"}</p>
              <div className="flex flex-wrap items-center gap-2">
                <RiskBadge level={result.riskLevel} language={language} />
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    result.analysisSource === "ai"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  {result.analysisSource === "ai"
                    ? (hi ? "Gemini AI द्वारा विश्लेषित" : "Analyzed by Gemini AI")
                    : (hi ? "ऑफ़लाइन फ़ॉलबैक मोड" : "Offline fallback mode")}
                </span>
              </div>
            </div>
            <div className="sm:text-right">
              <div className={`text-3xl font-bold tracking-tight ${scoreColor[result.riskLevel]}`}>
                {displayedScore}<span className="text-base font-semibold text-slate-400">/100</span>
              </div>
              <p className="mt-1 text-xs font-medium text-slate-500">{hi ? "जोखिम स्कोर" : "Risk score"}</p>
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={result.riskScore} aria-valuemin={0} aria-valuemax={100} aria-label="Risk score">
            <div className={`h-full rounded-full transition-all duration-700 ${barColor[result.riskLevel]}`} style={{ width: `${result.riskScore}%` }} />
          </div>

          <p className="mt-6 text-pretty text-lg font-semibold leading-8 text-slate-900 sm:text-xl">{result.summary}</p>

          <div className="mt-7 grid gap-6 border-t border-slate-100 pt-7 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <h3 className="section-label"><Info aria-hidden="true" />{hi ? "यह जोखिम भरा क्यों हो सकता है" : "Why this may be risky"}</h3>
              <ul className="mt-3 grid gap-2.5">
                {result.reasons.map((reason) => (
                  <li key={reason} className="flex gap-3 text-sm leading-6 text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <h3 className="section-label"><Tags aria-hidden="true" />{hi ? "धोखाधड़ी का प्रकार" : "Scam category"}</h3>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                {getCategoryIcon(result.category)}
                <span>{result.category}</span>
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <h3 className="section-label"><Flag aria-hidden="true" />{hi ? "चेतावनी संकेत" : "Warning signs"}</h3>
              {result.warningSigns.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.warningSigns.map((sign) => <span key={sign} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">{sign}</span>)}
                </div>
              ) : <p className="mt-2 text-sm text-slate-600">{hi ? "कोई स्पष्ट चेतावनी संकेत नहीं मिला।" : "No clear warning signs detected."}</p>}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
            <h3 className="section-label text-blue-800"><ArrowRight aria-hidden="true" />{hi ? "आपको क्या करना चाहिए" : "What you should do"}</h3>
            <p className="mt-2 text-sm font-medium leading-6 text-blue-950">{result.action}</p>
          </div>
        </div>
      </div>
      {result.riskLevel === "DANGEROUS" && <ActionCard language={language} />}
      <p className="mt-4 text-center text-xs leading-5 text-slate-500">
        {hi
          ? "यह आकलन संदेश और दिखाई देने वाली URL विशेषताओं पर आधारित है। गंतव्य वेबसाइट को खोला नहीं गया।"
          : "This assessment is based on the message and visible URL characteristics. The destination website was not opened."}
      </p>
    </section>
  );
}
