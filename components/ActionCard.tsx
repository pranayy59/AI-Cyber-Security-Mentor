import { Ban, Building2, KeyRound, Landmark, MessageSquareOff } from "lucide-react";
import { REPORTING } from "@/lib/constants";
import type { Language } from "@/types/analysis";

export function ActionCard({ language }: { language: Language }) {
  const hi = language === "hi";
  const items = hi
    ? [
        [Ban, "संदिग्ध लिंक पर क्लिक न करें।"],
        [KeyRound, "OTP, PIN, पासवर्ड या बैंक जानकारी साझा न करें।"],
        [MessageSquareOff, "संदिग्ध भेजने वाले से बातचीत बंद करें।"],
        [Building2, "संबंधित संस्था से उसके आधिकारिक ऐप, वेबसाइट या नंबर के जरिए संपर्क करें।"],
        [Landmark, "पैसे का मामला हो तो तुरंत बैंक और आधिकारिक साइबर क्राइम चैनल से संपर्क करें।"],
      ]
    : [
        [Ban, "Do not click suspicious links."],
        [KeyRound, "Do not share OTP, PIN, passwords or banking information."],
        [MessageSquareOff, "Stop communicating with the suspicious sender."],
        [Building2, "Contact the organization using its official app, website or number."],
        [Landmark, "If money is involved, contact your bank and official cybercrime channels immediately."],
      ];

  return (
    <aside className="mt-5 rounded-2xl border border-red-900/70 bg-red-950/40 p-5 sm:p-6" aria-label="Immediate safety steps">
      <h3 className="text-base font-bold text-red-300">{hi ? "अभी ये कदम उठाएं" : "Take these steps now"}</h3>
      <ul className="mt-4 grid gap-3 text-sm leading-6 text-red-100">
        {items.map(([Icon, text]) => (
          <li key={text as string} className="flex items-start gap-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
            <span>{text as string}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-red-900/70 pt-4 text-xs leading-5 text-red-300">
        {hi ? "भारत में: साइबर अपराध हेल्पलाइन " : "In India: cybercrime helpline "}
        <strong>{REPORTING.indiaCybercrimeHelpline}</strong>{" · "}
        <a className="font-semibold underline underline-offset-2" href={REPORTING.indiaCybercrimeUrl} target="_blank" rel="noreferrer">
          cybercrime.gov.in
        </a>
      </p>
    </aside>
  );
}
