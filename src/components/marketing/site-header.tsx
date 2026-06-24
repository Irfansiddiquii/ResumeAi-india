import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { seoPages } from "@/config/seo-pages";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#7c7ff5] to-[#a855f7] text-white shadow-[0_6px_18px_-6px_rgba(124,127,245,.8)]">
            <FileText className="h-4 w-4" />
          </span>
          <span className="text-[15px]">
            ResumeAI <span className="font-medium text-muted-foreground">India</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          {seoPages.slice(0, 4).map((p) => (
            <Link
              key={p.slug}
              href={`/${p.slug}`}
              className="transition-colors hover:text-foreground"
            >
              {p.navLabel}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/analyze">Upload Resume</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/analyze">Analyze Free →</Link>
          </Button>
        </div>
      </div>
      <span className="sr-only">{siteConfig.name}</span>
    </header>
  );
}
