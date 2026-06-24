import type { FileKind } from "@/lib/validation";
import { extractPdfText } from "./extract-pdf";
import { extractDocxText } from "./extract-docx";

export class ResumeParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResumeParseError";
  }
}

/** Collapse whitespace while keeping line breaks meaningful for parsing. */
function normalize(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Extract and normalize text from a resume buffer based on its file kind. */
export async function extractResumeText(
  buffer: Buffer,
  kind: FileKind
): Promise<string> {
  let raw = "";
  try {
    raw = kind === "pdf" ? await extractPdfText(buffer) : await extractDocxText(buffer);
  } catch {
    throw new ResumeParseError(
      "We couldn't read this file. It may be corrupted or password-protected."
    );
  }

  const text = normalize(raw);

  if (text.length < 50) {
    throw new ResumeParseError(
      "We couldn't extract enough text. If this is a scanned/image PDF, please upload a text-based PDF or DOCX."
    );
  }

  return text;
}
