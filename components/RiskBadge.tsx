import { CircleCheck, ShieldAlert, TriangleAlert } from "lucide-react";
import type { Language, RiskLevel } from "@/types/analysis";

const styles: Record<RiskLevel, string> = {
  SAFE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  SUSPICIOUS: "border-amber-200 bg-amber-50 text-amber-700",
  DANGEROUS: "border-red-200 bg-red-50 text-red-700",
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
