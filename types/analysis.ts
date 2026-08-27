export type Language = "en" | "hi";
export type RiskLevel = "SAFE" | "SUSPICIOUS" | "DANGEROUS";

export interface AnalysisResult {
  riskLevel: RiskLevel;
  riskScore: number;
  category: string;
  summary: string;
  reasons: string[];
  action: string;
  warningSigns: string[];
}

export type AnalysisSource = "ai" | "fallback";

export interface AnalysisResponse extends AnalysisResult {
  analysisSource: AnalysisSource;
}
