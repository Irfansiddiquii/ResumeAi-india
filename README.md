# ResumeAI India

A **free-first** ATS resume analyzer for job seekers in India. Upload a resume, get an instant ATS score, missing keywords, a job-match percentage, AI-powered suggestions and an optimized preview — then download a PDF/HTML report. **No login, no payment, no friction.**

> Built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Gemini 2.0 Flash, Supabase (optional) and Upstash Redis (optional). Deploys to Vercel.

---

## ✨ What works today (Phase 0 + Phase 1)

The entire core flow is live and works **without an account**:

```
Homepage → Upload Resume (PDF/DOCX) → Paste Job Description (optional)
→ Analyze → ATS Score + Strength + Job Match% → Missing Keywords
→ Suggestions → Optimized Resume Preview → Download PDF/HTML Report
```

- ATS / Resume-Strength / Job-Match scoring (deterministic + explainable)
- AI analysis via **Gemini 2.0 Flash**, with an automatic **rule-based fallback** when no API key is set (so it works out of the box)
- Missing-keyword detection against a pasted job description
- Downloadable **PDF + HTML** reports (no account needed)
- 5 SEO landing pages + sitemap + robots + JSON-LD structured data
- IP rate limiting via Upstash (no-op when not configured)
- Privacy-first: anonymous users' **raw resume text is never stored**

---

## 🚀 Setup Guide

### Prerequisites
- Node.js 18+ (tested on Node 22)
- npm

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```
Every variable is **optional** for the core flow. Fill in what you have:

| Variable | Required? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical URLs, sitemap, OG tags |
| `GEMINI_API_KEY` | optional | Enables AI analysis (else rule-based fallback) |
| `GEMINI_MODEL` | optional | Defaults to `gemini-2.0-flash` |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | optional | IP rate limiting (else disabled) |
| `IP_HASH_SALT` | recommended | Salt for hashing IPs in usage events |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Phase 3 | Optional accounts & saved history |
| `SUPABASE_SERVICE_ROLE_KEY` | Phase 3 | Server-side guest persistence / claims |

> Get a Gemini key at https://aistudio.google.com/app/apikey
> Create an Upstash Redis DB at https://console.upstash.com/

### 3. Run locally
```bash
npm run dev          # http://localhost:3000
```

### 4. Production build
```bash
npm run build && npm run start
```

### 5. Health check
```bash
curl http://localhost:3000/api/health
```

---

## 🌐 Deployment Guide (Vercel)

1. **Push** this repo to GitHub.
2. In **Vercel → New Project**, import the repo. Framework preset: **Next.js** (auto-detected). No build settings to change.
3. Add **Environment Variables** (Project → Settings → Environment Variables) — same keys as `.env.local`. Set `NEXT_PUBLIC_SITE_URL` to your production domain (e.g. `https://resumeai.in`).
4. **Deploy**. The `/api/analyze` and `/api/report` routes run on the Node.js runtime (required by `pdf-parse`, `mammoth` and `@react-pdf/renderer`) and are already configured with `runtime = "nodejs"` and a 60s `maxDuration`.
5. **(Optional) Supabase** — when enabling accounts (Phase 3): create a Supabase project and run `supabase/migrations/0001_init.sql` in the SQL editor, then add the Supabase env vars.

> No environment variables are strictly required to deploy a working demo — the app degrades gracefully to the rule-based analyzer with rate limiting disabled.

---

## 📁 Folder Structure

```
src/
  app/
    (marketing)/        homepage, SEO pages ([slug]), about, privacy
    (tool)/             analyze/, result/[id]/
    api/                analyze · report · health  (+ claim in Phase 3)
    sitemap.ts · robots.ts · layout.tsx
  components/
    ui/                 shadcn/ui primitives
    marketing/          header, footer, hero sections, FAQ
    analyze/            AnalyzeWidget (upload + JD + analyze)
    result/             score ring, result view, download, save prompt
  lib/
    parsing/            pdf-parse + mammoth extraction
    analysis/           scoring · keywords · gemini · rule-based · analyzer · storage
    report/             html-report · pdf-report
    ratelimit.ts · validation.ts · seo.ts · features.ts · utils.ts
  config/               site.ts · seo-pages.ts
  types/                analysis.ts
supabase/migrations/    0001_init.sql   (Phase 3 schema + RLS)
docs/                   ARCHITECTURE.md
```

---

## 🔌 API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/analyze` | none | Parse resume + score + AI analysis. `multipart/form-data`: `resume` (File), `jobDescription` (optional). Guards: PDF/DOCX, ≤5MB, IP rate limit. |
| `POST` | `/api/report?format=pdf\|html` | none | Generate a downloadable report from a posted analysis result. |
| `GET`  | `/api/health` | none | Liveness + which services are configured. |
| `POST` | `/api/claim` | session | _(Phase 3)_ Attach a guest analysis to a new account. |
| `GET`  | `/api/analysis/[id]` | session/token | _(Phase 3)_ Fetch a saved/shared analysis. |

---

## 🗄️ Database Schema (Supabase — Phase 3)

Not needed for Phase 1. See `supabase/migrations/0001_init.sql`.

- **`profiles`** — `id` (→ `auth.users`), `full_name`, `avatar_url`, `created_at`
- **`analyses`** — `id`, `user_id` _(nullable = guest)_, `share_token`, `resume_filename`, `job_description`, `ats_score`, `strength_score`, `match_score`, `missing_keywords`, `matched_keywords`, `strengths`, `weaknesses`, `recommendations`, `optimized_resume`, `engine`, `created_at`
- **`usage_events`** — `ip_hash` (salted), `event`, `created_at`
- **RLS**: users access only their own rows; guest writes & share-token reads go through service-role server routes.

---

## 🔒 Free-first by design

Monetization (subscriptions, billing, Razorpay, upgrade modals, premium locks) is intentionally **kept out of the UI** behind feature flags in `src/lib/features.ts` (`PREMIUM_ENABLED`, `ACCOUNTS_ENABLED`, `ADS_ENABLED`). Nothing is forced on users; the core analysis is free forever.

---

## 🗺️ Roadmap

- **Phase 0** ✅ Scaffold, design system, feature flags
- **Phase 1** ✅ Core analyzer + download (no login) — **done & tested**
- **Phase 2** ⏳ Share links, richer usage analytics (rate limiting already wired)
- **Phase 3** ⏳ Optional Supabase auth + dashboard (saved history, progress)
- **Phase 4** ⏳ SEO expansion, dynamic OG images, a11y + Core Web Vitals pass
- **Future** Ads → premium optimization / cover letter / interview prep → recruiter marketplace
