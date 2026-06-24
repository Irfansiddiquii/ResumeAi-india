import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { seoPages } from "@/config/seo-pages";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="h-4 w-4" />
          </span>
          <span className="text-base">{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
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

        <Button asChild size="sm">
          <Link href="/analyze">Analyze Resume Free</Link>
        </Button>
      </div>
    </header>
  );
}
