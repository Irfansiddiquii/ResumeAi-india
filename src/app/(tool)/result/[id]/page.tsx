"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, SearchX, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultView } from "@/components/result/result-view";
import { loadResult } from "@/lib/analysis/storage";
import type { AnalysisResult, AnalyzeApiResponse, ApiError } from "@/types/analysis";

export default function ResultPage() {
  const params = useParams<{ id: string }>();
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [shared, setShared] = React.useState(false);
  const [status, setStatus] = React.useState<"loading" | "found" | "missing">(
    "loading"
  );

  React.useEffect(() => {
    const id = params?.id;
    if (!id) {
      setStatus("missing");
      return;
    }

    // 1) Try this tab's own analysis (fully client-side, the common case).
    const local = loadResult(id);
    if (local) {
      setResult(local);
      setStatus("found");
      return;
    }

    // 2) Otherwise treat the id as a share token and fetch the shared result.
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/analysis/${encodeURIComponent(id)}`);
        const data = (await res.json()) as AnalyzeApiResponse | ApiError;
        if (!cancelled && res.ok && data.ok) {
          setResult(data.result);
          setShared(true);
          setStatus("found");
        } else if (!cancelled) {
          setStatus("missing");
        }
      } catch {
        if (!cancelled) setStatus("missing");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params]);

  if (status === "loading") {
    return (
      <div className="container flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "missing" || !result) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <SearchX className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-xl font-semibold">Analysis not found</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          This result has expired or was opened in a different browser. Run a
          new analysis to see your scores again.
        </p>
        <Button asChild className="mt-6">
          <Link href="/analyze">Analyze a resume</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-14">
      <div className="mx-auto max-w-3xl">
        {shared && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <Share2 className="h-4 w-4 shrink-0 text-primary" />
            You&apos;re viewing a shared resume analysis.
            <Link
              href="/analyze"
              className="ml-auto font-medium text-primary hover:underline"
            >
              Analyze your own →
            </Link>
          </div>
        )}
        <ResultView result={result} />
      </div>
    </div>
  );
}
