import { z } from "zod";

export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ACCEPTED_MIME_TYPES = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
} as const;

export type AcceptedMime = keyof typeof ACCEPTED_MIME_TYPES;
export type FileKind = (typeof ACCEPTED_MIME_TYPES)[AcceptedMime];

export const ACCEPTED_EXTENSIONS = [".pdf", ".docx"] as const;

/** Job description is optional and capped to keep prompts/cost bounded. */
export const jobDescriptionSchema = z
  .string()
  .max(20000, "Job description is too long.")
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined));

export interface FileValidationResult {
  ok: boolean;
  kind?: FileKind;
  error?: string;
}

/** Validate an uploaded resume file by size + mime/extension. */
export function validateResumeFile(file: {
  name: string;
  type: string;
  size: number;
}): FileValidationResult {
  if (file.size === 0) {
    return { ok: false, error: "The uploaded file is empty." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, error: "File is larger than the 5 MB limit." };
  }

  const lowerName = file.name.toLowerCase();
  const extOk = ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const mimeKind = ACCEPTED_MIME_TYPES[file.type as AcceptedMime];

  if (mimeKind) {
    return { ok: true, kind: mimeKind };
  }

  // Some browsers send a generic/empty mime type — fall back to extension.
  if (extOk) {
    return {
      ok: true,
      kind: lowerName.endsWith(".pdf") ? "pdf" : "docx",
    };
  }

  return {
    ok: false,
    error: "Unsupported file type. Please upload a PDF or DOCX resume.",
  };
}


// ── Analysis result payload validation ───────────────────────
// Used by /api/share and /api/report to validate a result posted from the
// client (Phase 1/2 have no server-side persistence of the original analysis).
const suggestionSchema = z.object({
  title: z.string(),
  before: z.string().optional(),
  after: z.string().optional(),
});

export const analysisResultSchema = z.object({
  id: z.string().max(64),
  shareToken: z.string().max(64).optional(),
  createdAt: z.string(),
  resumeFilename: z.string().max(300),
  hasJobDescription: z.boolean(),
  scores: z.object({
    ats: z.number(),
    strength: z.number(),
    match: z.number().nullable(),
  }),
  missingKeywords: z.array(z.string()).max(100),
  matchedKeywords: z.array(z.string()).max(100),
  strengths: z.array(z.string()).max(50),
  weaknesses: z.array(z.string()).max(50),
  recommendations: z.array(suggestionSchema).max(50),
  optimizedResume: z.object({
    summary: z.string(),
    bullets: z.array(z.string()).max(50),
  }),
  engine: z.enum(["gemini", "rule-based"]),
});
