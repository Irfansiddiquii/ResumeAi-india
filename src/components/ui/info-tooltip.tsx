import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dependency-free, accessible tooltip. Shows on hover and on keyboard focus
 * (CSS group-hover / group-focus-within). Used to explain every metric so
 * users understand what each number means.
 */
export function InfoTooltip({
  text,
  side = "bottom",
  className,
}: {
  text: string;
  side?: "top" | "bottom";
  className?: string;
}) {
  return (
    <span className={cn("group/tt relative inline-flex align-middle", className)}>
      <button
        type="button"
        aria-label={text}
        className="text-muted-foreground/60 outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 w-60 max-w-[78vw] -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-xs font-normal normal-case leading-relaxed tracking-normal text-muted-foreground opacity-0 shadow-xl transition-opacity duration-150 group-hover/tt:opacity-100 group-focus-within/tt:opacity-100",
          side === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
        )}
      >
        {text}
      </span>
    </span>
  );
}
