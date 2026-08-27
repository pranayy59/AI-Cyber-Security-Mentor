import { z } from "zod";

export const analyzeRequestSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(3, "Please paste a message, email or link first.")
      .max(8_000, "Message must be 8,000 characters or fewer."),
    language: z.enum(["en", "hi"]),
  })
  .strict();

const conciseString = z.string().trim().min(1).max(500);

export const analysisSchema = z
  .object({
    riskLevel: z.enum(["SAFE", "SUSPICIOUS", "DANGEROUS"]),
    riskScore: z.number().int().min(0).max(100),
    category: conciseString,
    categoryDescription: conciseString,
    summary: conciseString,
    reasons: z.array(conciseString).min(1).max(4),
    action: conciseString,
    warningSigns: z.array(conciseString).max(6),
  })
  .strict()
  .superRefine((value, ctx) => {
    const ranges = { SAFE: [0, 34], SUSPICIOUS: [35, 69], DANGEROUS: [70, 100] } as const;
    const [min, max] = ranges[value.riskLevel];
    if (value.riskScore < min || value.riskScore > max) {
      ctx.addIssue({ code: "custom", path: ["riskScore"], message: "Score does not match risk level" });
    }
    if (value.riskLevel === "SAFE" && value.warningSigns.length > 0) {
      ctx.addIssue({ code: "custom", path: ["warningSigns"], message: "Safe results cannot contain warning signs" });
    }
    if (value.riskLevel === "SAFE" && value.categoryDescription.trim().length === 0) {
      ctx.addIssue({ code: "custom", path: ["categoryDescription"], message: "Safe results require a category description" });
    }
  });

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
