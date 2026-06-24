"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultView } from "@/components/result/result-view";
import { loadResult } from "@/lib/analysis/storage";
import type { AnalysisResult } from "@/types/analysis";

export default function ResultPage() {
  const params = useParams<{ id: string }>();
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [status, setStatus] = React.useState<"loading" | "found" | "missing">(
    "loading"
  );

  React.useEffect(() => {
    const id = params?.id;
    if (!id) {
      setStatus("missing");
      return;
    }
    const r = loadResult(id);
    if (r) {
      setResult(r);
      setStatus("found");
    } else {
      setStatus("missing");
    }
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
        <ResultView result={result} />
      </div>
    </div>
  );
}
