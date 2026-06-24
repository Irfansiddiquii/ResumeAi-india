import Link from "next/link";
import { FileText } from "lucide-react";
import { siteConfig } from "@/config/site";
import { seoPages } from "@/config/seo-pages";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-background">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#7c7ff5] to-[#a855f7] text-white">
                <FileText className="h-4 w-4" />
              </span>
              {siteConfig.name}
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Free, ATS-friendly resume analysis for job seekers in India. Check
              your resume score, find missing keywords and get AI suggestions —
              no login required.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium">Free Tools</p>
            <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              {seoPages.map((p) => (
                <li key={p.slug}>
                  <Link href={`/${p.slug}`} className="transition-colors hover:text-foreground">
                    {p.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium">Company</p>
            <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">About</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
              <li><Link href="/analyze" className="hover:text-foreground">Analyze Resume</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/80 pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. Built for job seekers in India.
        </div>
      </div>
    </footer>
  );
}
