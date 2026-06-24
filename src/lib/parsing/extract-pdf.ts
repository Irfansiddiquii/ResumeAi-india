// Import the implementation directly. The package's index.js runs debug code
// (reading a sample PDF) when imported as the main module, which can throw in
// a serverless/bundled context. The lib entrypoint avoids that.
// eslint-disable-next-line @typescript-eslint/no-require-imports
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text ?? "";
}
