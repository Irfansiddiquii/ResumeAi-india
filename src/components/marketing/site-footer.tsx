import Link from "next/link";
import { siteConfig } from "@/config/site";
import { seoPages } from "@/config/seo-pages";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-base font-semibold">{siteConfig.name}</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Free, ATS-friendly resume analysis for job seekers in India.
              Check your resume score, find missing keywords and get AI
              suggestions — no login required.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium">Free Tools</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {seoPages.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/${p.slug}`}
                    className="transition-colors hover:text-foreground"
                  >
                    {p.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/analyze" className="hover:text-foreground">
                  Analyze Resume
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. Built for job seekers
          in India.
        </div>
      </div>
    </footer>
  );
}
