import { CircleCheck, ShieldAlert, TriangleAlert } from "lucide-react";
import type { Language, RiskLevel } from "@/types/analysis";

const styles: Record<RiskLevel, string> = {
  SAFE: "border-emerald-800 bg-emerald-950/50 text-emerald-300",
  SUSPICIOUS: "border-amber-800 bg-amber-950/50 text-amber-300",
  DANGEROUS: "border-red-800 bg-red-950/50 text-red-300",
};

const labels: Record<RiskLevel, Record<Language, string>> = {
  SAFE: { en: "SAFE", hi: "सुरक्षित" },
  SUSPICIOUS: { en: "SUSPICIOUS", hi: "संदिग्ध" },
  DANGEROUS: { en: "DANGEROUS", hi: "खतरनाक" },
};

export function RiskBadge({ level, language }: { level: RiskLevel; language: Language }) {
  const Icon = level === "SAFE" ? CircleCheck : level === "SUSPICIOUS" ? ShieldAlert : TriangleAlert;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold tracking-wide ${styles[level]}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {labels[level][language]}
    </span>
  );
}
