"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  X,
  Loader2,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { saveResult } from "@/lib/analysis/storage";
import type { AnalyzeApiResponse, ApiError } from "@/types/analysis";

const MAX_MB = 5;
const ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".pdf") || name.endsWith(".docx");
}

export function AnalyzeWidget({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [jobDescription, setJobDescription] = React.useState("");
  const [showJd, setShowJd] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  function handleFiles(files: FileList | null) {
    setError(null);
    const f = files?.[0];
    if (!f) return;
    if (!isAcceptedFile(f)) {
      setError("Please upload a PDF or DOCX file.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File is larger than the ${MAX_MB} MB limit.`);
      return;
    }
    setFile(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }

  async function handleAnalyze() {
    if (!file) {
      setError("Please upload your resume first.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("resume", file);
      if (jobDescription.trim()) fd.append("jobDescription", jobDescription.trim());

      const res = await fetch("/api/analyze", { method: "POST", body: fd });
      const data = (await res.json()) as AnalyzeApiResponse | ApiError;

      if (!res.ok || !data.ok) {
        const message =
          (data as ApiError).error?.message ??
          "Something went wrong. Please try again.";
        setError(message);
        setLoading(false);
        return;
      }

      saveResult(data.result);
      router.push(`/result/${data.result.id}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-background px-6 text-center transition-colors",
          compact ? "py-8" : "py-12",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-input hover:border-primary/60 hover:bg-accent/40"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {file ? (
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </span>
            <div className="text-left">
              <p className="max-w-[200px] truncate text-sm font-medium sm:max-w-xs">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="ml-2 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UploadCloud className="h-6 w-6" />
            </span>
            <p className="text-sm font-medium">
              Drag & drop your resume, or{" "}
              <span className="text-primary">browse</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF or DOCX · up to {MAX_MB} MB · no login required
            </p>
          </>
        )}
      </div>

      {/* Optional job description */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowJd((s) => !s)}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              showJd && "rotate-180"
            )}
          />
          Add a job description (optional, improves match accuracy)
        </button>
        {showJd && (
          <div className="mt-3 animate-fade-in">
            <Label htmlFor="jd" className="sr-only">
              Job description
            </Label>
            <Textarea
              id="jd"
              placeholder="Paste the job description here to get a job-match score and the exact keywords you're missing…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[140px]"
            />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        size="lg"
        className="mt-4 w-full"
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            Analyzing your resume…
          </>
        ) : (
          <>
            <Sparkles />
            Analyze Resume Free
          </>
        )}
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Free forever · No sign-up · No credit card
      </p>
    </div>
  );
}
