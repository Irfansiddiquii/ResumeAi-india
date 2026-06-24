# ResumeAI India — Product Architecture (v1, MVP)

> **Model:** Free-first growth platform. Core ATS analysis works with **zero login, zero payment, zero friction**. Monetization is deferred to later phases. Success = traffic, uploads, returning visitors, and search rankings.

---

## 1. Complete Product Architecture

### 1.1 High-level system

```
                        ┌─────────────────────────────────────────────┐
                        │                  BROWSER                      │
                        │  Next.js 15 (App Router) · React Server       │
                        │  Components + Client Components               │
                        │  Tailwind CSS · shadcn/ui                     │
                        └───────────────┬───────────────────────────────┘
                                        │  HTTPS
                        ┌───────────────▼───────────────────────────────┐
                        │              VERCEL EDGE / NODE                │
                        │                                                │
                        │  ┌──────────────┐   ┌───────────────────────┐  │
                        │  │  App routes  │   │   API Route Handlers  │  │
                        │  │  (SSG/SSR)   │   │   /api/*  (Node runtime)│ │
                        │  └──────────────┘   └───────────┬───────────┘  │
                        │                                  │              │
                        │   Resume parsing (server):       │              │
                        │   pdf-parse · mammoth            │              │
                        └──────────────┬───────────────────┼─────────────┘
                                       │                    │
                  ┌────────────────────▼──────┐   ┌─────────▼───────────────┐
                  │     Google Gemini API     │   │       Supabase          │
                  │  (analysis + optimization)│   │  Postgres · Auth · RLS  │
                  │                           │   │  (optional persistence) │
                  └───────────────────────────┘   └─────────────────────────┘
                                       
                  ┌───────────────────────────┐
                  │   Upstash Redis (optional)│  ← IP rate limiting / abuse control
                  └───────────────────────────┘
```

### 1.2 Core design principles

| Principle | Implementation |
|---|---|
| **Anonymous-first** | The `/api/analyze` endpoint requires **no auth**. Results return directly to the browser. |
| **Stateless by default** | Guest analysis does **not** need DB writes. Persistence only happens when a logged-in user (or a "claim" action) saves a report. |
| **Monetization in code, hidden in UI** | All billing/subscription/Razorpay/paywall components live behind a single `features.ts` flag map (`PREMIUM_ENABLED = false`). Nothing is deleted — just not rendered. |
| **SEO as a first-class feature** | Marketing + tool landing pages are statically generated (SSG/ISR) with full metadata, JSON-LD, sitemap, and OG images. |
| **Pluggable AI** | Analysis goes through an `analyzer` service interface. A deterministic rule-based engine is the fallback; Gemini is the primary provider. Swappable without touching routes. |

### 1.3 Analysis pipeline

```
Upload (PDF/DOCX, ≤5MB)
   → validate (mime, size, rate limit by IP hash)
   → extract text (pdf-parse | mammoth)
   → normalize + tokenize
   → [optional] parse Job Description
   → SCORING ENGINE
        ├─ ATS Score (0–100)        formatting, sections, length, parse-ability
        ├─ Resume Strength Score    action verbs, quantification, clarity
        └─ Job Match Score          keyword overlap vs JD (only if JD provided)
   → GEMINI ANALYSIS
        ├─ Missing keywords
        ├─ Strengths / Weaknesses
        ├─ Recommendations
        └─ Optimized bullet points + ATS-friendly rewrite
   → assemble AnalysisResult
   → return JSON  (+ optional persist if logged in)
```

---

## 2. Folder Structure

```
resumeai-india/
├── public/
│   ├── og/                          # generated/static OG images
│   ├── robots.txt
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── (marketing)/             # public, SEO-optimized, SSG
│   │   │   ├── page.tsx             # Homepage  ("Analyze Resume Free")
│   │   │   ├── ats-resume-checker/page.tsx
│   │   │   ├── resume-analyzer/page.tsx
│   │   │   ├── resume-score-checker/page.tsx
│   │   │   ├── free-resume-review/page.tsx
│   │   │   ├── resume-keyword-checker/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   └── layout.tsx           # marketing nav/footer
│   │   │
│   │   ├── (tool)/                  # the actual analyzer experience
│   │   │   ├── analyze/page.tsx     # upload + JD + run analysis
│   │   │   └── result/[id]/page.tsx # shareable result view
│   │   │
│   │   ├── (app)/                   # gated: only after optional account creation
│   │   │   ├── dashboard/page.tsx   # saved analyses, history, progress
│   │   │   └── layout.tsx           # requires session
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── callback/route.ts    # supabase auth callback
│   │   │
│   │   ├── api/
│   │   │   ├── analyze/route.ts          # POST: parse + score + AI (NO AUTH)
│   │   │   ├── analysis/[id]/route.ts    # GET: fetch saved analysis
│   │   │   ├── report/route.ts           # POST: generate downloadable report
│   │   │   ├── claim/route.ts            # POST: attach guest result to new account
│   │   │   └── health/route.ts
│   │   │
│   │   ├── sitemap.ts                # dynamic sitemap.xml
│   │   ├── robots.ts                 # robots route
│   │   ├── layout.tsx                # root layout + <head> defaults
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives
│   │   ├── marketing/                # Hero, FeatureGrid, FAQ, CTASection
│   │   ├── analyze/                  # UploadDropzone, JobDescriptionInput, AnalyzeButton
│   │   ├── result/                   # ScoreGauge, KeywordList, SuggestionCard,
│   │   │                             #   OptimizedPreview, DownloadReportButton,
│   │   │                             #   SaveReportPrompt  (optional account CTA)
│   │   └── premium/                  # ⛔ hidden behind feature flag (Pricing, UpgradeModal)
│   │
│   ├── lib/
│   │   ├── parsing/
│   │   │   ├── extract-pdf.ts        # pdf-parse wrapper
│   │   │   ├── extract-docx.ts       # mammoth wrapper
│   │   │   └── extract.ts            # dispatch by mime
│   │   ├── analysis/
│   │   │   ├── scoring.ts            # deterministic ATS/strength/match scoring
│   │   │   ├── keywords.ts           # keyword extraction + overlap
│   │   │   ├── gemini.ts             # Gemini client + prompt templates
│   │   │   └── analyzer.ts           # orchestrates scoring + Gemini, returns AnalysisResult
│   │   ├── report/
│   │   │   └── generate-report.ts    # build PDF/HTML report (no login)
│   │   ├── supabase/
│   │   │   ├── client.ts             # browser client
│   │   │   ├── server.ts             # server client (RLS-aware)
│   │   │   └── admin.ts              # service-role (server-only)
│   │   ├── ratelimit.ts              # Upstash or in-memory fallback
│   │   ├── validation.ts             # zod schemas, file checks
│   │   ├── seo.ts                    # metadata + JSON-LD helpers
│   │   └── features.ts               # FEATURE FLAGS (premium off)
│   │
│   ├── types/
│   │   └── analysis.ts               # AnalysisResult, Scores, Keyword, Suggestion
│   └── config/
│       ├── site.ts                   # site name, urls, social
│       └── seo-pages.ts              # data driving the programmatic SEO pages
│
├── supabase/
│   └── migrations/                   # SQL schema + RLS policies
├── .env.example
├── components.json                   # shadcn config
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Database Schema (Supabase / Postgres)

> All persistence is **optional**. Guests never touch the DB unless they choose to save. RLS protects user rows.

### 3.1 `profiles`
| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | references `auth.users(id)` |
| `full_name` | `text` | nullable |
| `avatar_url` | `text` | nullable |
| `created_at` | `timestamptz` | default `now()` |

### 3.2 `analyses`
| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | default `gen_random_uuid()` |
| `user_id` | `uuid` | **nullable** (null = guest), FK `auth.users` |
| `share_token` | `text` unique | random, used for shareable result URLs |
| `resume_filename` | `text` | original file name |
| `job_description` | `text` | nullable |
| `ats_score` | `int` | 0–100 |
| `strength_score` | `int` | 0–100 |
| `match_score` | `int` | 0–100, null if no JD |
| `missing_keywords` | `jsonb` | `string[]` |
| `strengths` | `jsonb` | `string[]` |
| `weaknesses` | `jsonb` | `string[]` |
| `recommendations` | `jsonb` | `Suggestion[]` |
| `optimized_resume` | `jsonb` | rewritten bullets / sections |
| `created_at` | `timestamptz` | default `now()` |

> **Privacy choice:** we store the **analysis output**, not the raw resume file. Raw text is processed in-memory and discarded. (Configurable.)

### 3.3 `usage_events` (anonymous analytics + rate limiting)
| column | type | notes |
|---|---|---|
| `id` | `bigint` PK | identity |
| `ip_hash` | `text` | salted SHA-256 of IP (no raw IP stored) |
| `event` | `text` | `upload` / `analyze` / `download` |
| `created_at` | `timestamptz` | default `now()` |

### 3.4 RLS policies (summary)
- `profiles`: user can `select/update` only `id = auth.uid()`.
- `analyses`:
  - `insert`: allowed for authenticated users (own `user_id`); guest inserts go through a **service-role** server route only when saving.
  - `select`: owner (`user_id = auth.uid()`) **or** valid `share_token` (read-only public via server route).
  - `update/delete`: owner only.
- `usage_events`: no client access; writes via service role from API routes only.

### 3.5 Claim flow (guest → account)
When a guest signs up after analyzing, the client passes the `share_token`; `/api/claim` (service role) sets `user_id` on that analysis row if it's currently null.

---

## 4. API Design

All under `src/app/api`. Node runtime (pdf-parse/mammoth need Node, not Edge).

### `POST /api/analyze`  — core, **no auth**
- **Body:** `multipart/form-data` → `resume` (File), `jobDescription` (string, optional)
- **Guards:** mime ∈ {pdf, docx}, size ≤ 5MB, IP rate limit (e.g. 10/hour).
- **Process:** extract text → score → Gemini analysis → assemble result.
- **Response 200:**
```jsonc
{
  "id": "uuid-or-ephemeral",
  "shareToken": "abc123",          // present only if persisted
  "scores": { "ats": 78, "strength": 71, "match": 64 },
  "missingKeywords": ["Kubernetes", "CI/CD"],
  "strengths": ["Strong quantified impact in last role"],
  "weaknesses": ["Summary too generic"],
  "recommendations": [
    { "title": "Add metrics to bullet 2", "before": "...", "after": "..." }
  ],
  "optimizedResume": { "summary": "...", "bullets": ["..."] }
}
```
- **Errors:** `400` invalid file, `413` too large, `429` rate limited, `502` AI upstream.

### `GET /api/analysis/[id]`
Fetch a saved/shared analysis. Auth via session **or** `?token=` (share_token). Read-only.

### `POST /api/report`
Generate a downloadable report (PDF) from an analysis id/token or an inline result. **No auth required.** Returns `application/pdf`.

### `POST /api/claim`
Body `{ shareToken }`. Requires session. Attaches a guest analysis to the current user.

### `GET /api/health`
Liveness + dependency checks (Gemini key present, Supabase reachable).

**Cross-cutting:** zod validation, structured JSON errors `{ error: { code, message } }`, request logging via `usage_events`, no PII in logs.

---

## 5. SEO Strategy

**Goal:** rank for high-intent, free-tool queries in India and globally; convert organic traffic into uploads.

### 5.1 Programmatic landing pages (SSG/ISR)
Driven by `config/seo-pages.ts`, each renders the upload tool above the fold + unique content below:

| Route | Primary keyword |
|---|---|
| `/` | free ATS resume checker / analyze resume free |
| `/ats-resume-checker` | ATS resume checker |
| `/resume-analyzer` | resume analyzer |
| `/resume-score-checker` | resume score checker |
| `/free-resume-review` | free resume review |
| `/resume-keyword-checker` | resume keyword checker |

### 5.2 On-page technical SEO
- Per-page `generateMetadata`: unique `<title>`, meta description, canonical, OpenGraph + Twitter cards.
- **JSON-LD structured data:** `SoftwareApplication` (the tool), `FAQPage` (each page's FAQ), `BreadcrumbList`.
- **Dynamic OG images** via `next/og` (`opengraph-image.tsx`).
- `sitemap.ts` (all marketing + SEO routes) and `robots.ts`.
- Semantic HTML, single `<h1>` per page, fast LCP (RSC, no blocking JS for content).
- Core Web Vitals budget; images optimized via `next/image`.

### 5.3 Content & growth
- Unique 300–600 word body + FAQ per SEO page (no duplicate content).
- Internal linking between tool pages and a future `/blog`.
- "Free, no signup" trust signals + shareable result URLs (`/result/[id]`) → natural backlinks.

---

## 6. User Flow Diagram

```
┌──────────────┐
│  Homepage    │  CTA: "Analyze Resume Free"  ·  Secondary: "Upload Resume"
│ (SEO pages)  │  NO pricing shown
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Upload Resume│  PDF / DOCX · ≤5MB · NO LOGIN
└──────┬───────┘
       │
       ▼
┌────────────────────┐
│ Paste Job Desc.    │  OPTIONAL (skippable)
└──────┬─────────────┘
       │
       ▼
┌──────────────┐
│   Analyze    │  → /api/analyze  (rate-limited, no auth)
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                       RESULT PAGE                             │
│  ATS Score · Strength · Job Match %                           │
│  Missing Keywords · Strengths · Weaknesses                    │
│  Improvement Suggestions · Optimized Resume Preview           │
│  [ Download Report ]   ← works WITHOUT account                │
└──────┬───────────────────────────────────────┬───────────────┘
       │                                        │
       ▼                                        ▼
┌────────────────────────────┐         ┌──────────────────────┐
│ "Save reports & track       │         │ Continue Without      │
│  progress?"                 │         │ Account  (done)       │
│ [Create Free Account]       │         └──────────────────────┘
└──────┬──────────────────────┘
       │ (optional, only now)
       ▼
┌──────────────┐
│  Dashboard   │  Saved Analyses · Resume History · Progress Tracking
└──────────────┘

  ⛔ Hidden behind feature flag (not in MVP UI):
     Subscription Plans · Razorpay · Billing · Upgrade Modals · Premium Locks
```

---

## 7. MVP Roadmap

### Phase 0 — Foundation (scaffold)
- Next.js 15 + TS + Tailwind + shadcn/ui init, project structure, `features.ts` flags, `.env.example`, base layout, site config.

### Phase 1 — Core analyzer (the product) ⭐
- Upload UI (PDF/DOCX, ≤5MB, validation) → `/api/analyze`.
- Parsing (pdf-parse, mammoth) + deterministic scoring engine.
- Gemini integration (analysis, keywords, suggestions, optimized resume).
- Result page: scores, keywords, strengths/weaknesses, suggestions, optimized preview.
- **All without login.**

### Phase 2 — Download + share
- `/api/report` downloadable PDF report (no login).
- Shareable `/result/[id]` pages + `share_token`.
- IP rate limiting + `usage_events` logging.

### Phase 3 — Optional accounts
- Supabase Auth (email + Google), `(auth)` routes.
- "Save reports?" prompt, `/api/claim`, Dashboard (saved analyses, history, progress).

### Phase 4 — SEO pages + polish
- All 5 SEO landing pages + homepage, metadata, JSON-LD, sitemap, robots, OG images.
- Accessibility + Core Web Vitals pass.

### Phase 5 — Deploy
- Vercel deploy, env config, Supabase migrations, smoke test, health check.

### Future (NOT in MVP — code stubs only, flag-gated)
- **Phase 2 monetization:** Google AdSense, sponsored jobs, recruiter ads.
- **Phase 3 premium:** advanced optimization, LinkedIn optimization, cover letter generator, interview prep.
- **Phase 4:** recruiter marketplace, career coaching.

---

## Key decisions needing your confirmation
1. **Gemini model:** default to `gemini-1.5-flash` (fast/cheap) with `gemini-1.5-pro` fallback — OK?
2. **Resume storage:** store **analysis output only**, discard raw resume text (privacy-first) — OK? Or keep raw text for logged-in history?
3. **Rate limiting:** use **Upstash Redis** (recommended, free tier) vs. a simpler Supabase-table limiter?
4. **Report format:** **PDF** download (via a server renderer) — OK? Or also offer HTML/Markdown?
```
