"use client";

import * as React from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/types/analysis";

async function download(result: AnalysisResult, format: "pdf" | "html") {
  const res = await fetch(`/api/report?format=${format}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ result }),
  });
  if (!res.ok) throw new Error("Failed to generate report");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const base = result.resumeFilename.replace(/\.[^.]+$/, "") || "resume";
  a.href = url;
  a.download = `${base}-ResumeAI-report.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function DownloadReport({ result }: { result: AnalysisResult }) {
  const [busy, setBusy] = React.useState<"pdf" | "html" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handle(format: "pdf" | "html") {
    setBusy(format);
    setError(null);
    try {
      await download(result, format);
    } catch {
      setError("Could not generate the report. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button onClick={() => handle("pdf")} disabled={busy !== null}>
        {busy === "pdf" ? <Loader2 className="animate-spin" /> : <Download />}
        Download PDF Report
      </Button>
      <Button
        variant="outline"
        onClick={() => handle("html")}
        disabled={busy !== null}
      >
        {busy === "html" ? <Loader2 className="animate-spin" /> : <FileText />}
        Download HTML
      </Button>
      {error && (
        <p className="self-center text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
