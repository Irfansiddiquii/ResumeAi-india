"use client";

import * as React from "react";
import { Share2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/types/analysis";

type State = "idle" | "loading" | "copied" | "error";

export function ShareButton({ result }: { result: AnalysisResult }) {
  const [state, setState] = React.useState<State>("idle");
  const [message, setMessage] = React.useState<string | null>(null);

  async function handleShare() {
    setState("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setState("error");
        setMessage(data?.error?.message ?? "Could not create a share link.");
        return;
      }

      const url = `${window.location.origin}/result/${data.token}`;
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // Clipboard may be blocked; still show the link below.
      }
      setState("copied");
      setMessage(url);
      window.setTimeout(() => setState("idle"), 5000);
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        onClick={handleShare}
        disabled={state === "loading"}
      >
        {state === "loading" ? (
          <Loader2 className="animate-spin" />
        ) : state === "copied" ? (
          <Check />
        ) : (
          <Share2 />
        )}
        {state === "copied" ? "Link copied!" : "Share"}
      </Button>
      {message && state !== "loading" && (
        <p
          className={cn(
            "max-w-[260px] truncate text-xs",
            state === "error" ? "text-destructive" : "text-muted-foreground"
          )}
          title={message}
        >
          {state === "copied" ? "Link copied to clipboard" : message}
        </p>
      )}
    </div>
  );
}
