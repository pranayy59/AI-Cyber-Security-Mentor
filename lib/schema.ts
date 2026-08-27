import { z } from "zod";

const languageSchema = z.enum(["en", "hi"]);

const textAnalyzeRequestSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(3, "Please paste a message, email or link first.")
      .max(8_000, "Message must be 8,000 characters or fewer."),
    language: languageSchema,
  })
  .strict();

const imageAnalyzeRequestSchema = z
  .object({
    image: z
      .string()
      .trim()
      .min(1, "Image data is required.")
      .max(5_600_000, "Image must be 4 MB or smaller.")
      .regex(/^[A-Za-z0-9+/]+={0,2}$/, "Image data must be valid base64.")
      .refine((value) => value.length % 4 === 0, "Image data must be valid base64."),
    imageMimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    language: languageSchema,
  })
  .strict();

export const analyzeRequestSchema = z.union([
  textAnalyzeRequestSchema,
  imageAnalyzeRequestSchema,
]);

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
