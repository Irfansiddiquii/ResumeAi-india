import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  KeyRound,
  Wand2,
  Sparkles,
  ArrowRight,
  Gauge,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScoreGauge } from "@/components/result/score-gauge";
import { DownloadReport } from "@/components/result/download-report";
import { ShareButton } from "@/components/result/share-button";
import { SaveReportPrompt } from "@/components/result/save-report-prompt";
import { FEATURES } from "@/lib/features";
import { getGrade, GRADE_SCALE, activeGradeIndex, type GradeTone } from "@/lib/grade";
import type { AnalysisResult } from "@/types/analysis";

const TONE: Record<GradeTone, string> = {
  success: "border-success/35 bg-success/15 text-success",
  cyan: "border-cyan/35 bg-cyan/15 text-cyan",
  warning: "border-warning/35 bg-warning/15 text-warning",
  destructive: "border-destructive/35 bg-destructive/15 text-destructive",
};

function barColor(score: number): string {
  if (score >= 70) return "#34d399";
  if (score >= 55) return "#fbbf24";
  return "#fb7185";
}

function SectionTitle({
  icon: Icon,
  children,
  className = "",
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${className}`}>
      <Icon className="h-4 w-4" />
      {children}
    </h3>
  );
}

function MetricTile({
  icon, tint, label, value, suffix = "", from, to,
}: {
  icon: string; tint: string; label: string; value: number | null; suffix?: string; from: string; to: string;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-card px-4 py-3.5">
      <span className={`grid h-9 w-9 flex-none place-items-center rounded-[10px] text-base ${tint}`}>{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] text-muted-foreground">{label}</div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
          <span className="block h-full rounded-full" style={{ width: `${value ?? 0}%`, background: `linear-gradient(90deg, ${from}, ${to})` }} />
        </div>
      </div>
      <span className="text-lg font-extrabold tracking-tight">
        {value === null ? "—" : `${value}${suffix}`}
      </span>
    </div>
  );
}

export function ResultView({ result }: { result: AnalysisResult }) {
  const grade = getGrade(result.scores.ats);
  const activeIdx = activeGradeIndex(result.scores.ats);
  const breakdown = result.breakdown ?? [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 pb-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-[28px]">
            Your resume analysis
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-muted-foreground">
            <span className="max-w-[220px] truncate">{result.resumeFilename}</span>
            <span>·</span>
            <Badge variant={result.engine === "gemini" ? "default" : "secondary"}>
              {result.engine === "gemini" ? (
                <><Sparkles className="mr-1 h-3 w-3" /> AI analysis</>
              ) : (
                "Instant analysis"
              )}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <DownloadReport result={result} />
          {FEATURES.SHAREABLE_RESULTS && <ShareButton result={result} />}
        </div>
      </div>

      {/* Summary: gauge + verdict | metric tiles */}
      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -left-10 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(52,211,153,.16),transparent)]" />
          <CardContent className="relative flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-7">
            <ScoreGauge value={result.scores.ats} size={150} label="ATS SCORE / 100" />
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center gap-3 sm:justify-start">
                <span className={`grid h-12 w-12 place-items-center rounded-xl border text-2xl font-extrabold ${TONE[grade.tone]}`}>
                  {grade.letter}
                </span>
                <span className="text-xl font-bold tracking-tight">{grade.label}</span>
              </div>
              <p className="mt-2.5 max-w-xs text-sm text-muted-foreground">
                {result.scores.ats >= 80
                  ? "Your resume is in great shape and ATS-readable. Polish the items below to stay ahead."
                  : "Your resume is solid and ATS-readable. Fix the high-impact items below to push into the A range."}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-rows-3 gap-3">
          <MetricTile icon="📊" tint="bg-primary/15 text-primary" label="ATS Compatibility" value={result.scores.ats} from="#34d399" to="#22d3ee" />
          <MetricTile icon="💪" tint="bg-violet/15 text-violet" label="Resume Strength" value={result.scores.strength} from="#7c7ff5" to="#a855f7" />
          <MetricTile icon="🎯" tint="bg-cyan/15 text-cyan" label="Job Match" value={result.scores.match} suffix="%" from="#22d3ee" to="#34d399" />
        </div>
      </div>

      {/* Grade scale */}
      <Card>
        <CardContent className="p-5 sm:p-6">
          <SectionTitle icon={TrendingUp}>Resume Grade</SectionTitle>
          <div className="flex gap-2">
            {GRADE_SCALE.map((seg, i) => {
              const active = i === activeIdx;
              return (
                <div
                  key={seg.letter}
                  className={`flex-1 rounded-xl border py-2.5 text-center transition-colors ${
                    active
                      ? "border-success/40 bg-gradient-to-b from-success/25 to-cyan/10 text-foreground shadow-[0_0_0_1px_rgba(52,211,153,.35)_inset]"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <div className="text-sm font-bold">{seg.letter}</div>
                  <div className={`mt-0.5 text-[10.5px] ${active ? "text-success" : "text-muted-foreground/70"}`}>
                    {seg.range}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Breakdown | Keyword analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        {breakdown.length > 0 && (
          <Card>
            <CardContent className="p-5 sm:p-6">
              <SectionTitle icon={BarChart3}>Score breakdown</SectionTitle>
              <div className="space-y-0.5">
                {breakdown.map((cat) => (
                  <div key={cat.label} className="flex items-center gap-3.5 border-b border-border py-3 last:border-0">
                    <span className="w-24 text-sm">{cat.label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                      <span className="block h-full rounded-full" style={{ width: `${cat.score}%`, background: barColor(cat.score) }} />
                    </div>
                    <span className="w-9 text-right text-sm font-bold">{cat.score}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-5 sm:p-6">
            <SectionTitle icon={KeyRound}>Keyword analysis</SectionTitle>
            {result.hasJobDescription && result.scores.match !== null ? (
              <div className="mb-4 flex items-center gap-4">
                <ScoreGauge value={result.scores.match} size={78} />
                <div>
                  <div className="text-sm font-semibold">
                    {result.scores.match >= 70 ? "Strong keyword match" : "Room to improve match"}
                  </div>
                  <div className="text-[13px] text-muted-foreground">
                    {result.matchedKeywords.length} matched, {result.missingKeywords.length} missing. Add the missing ones where they truly apply.
                  </div>
                </div>
              </div>
            ) : (
              <p className="mb-4 text-[13px] text-muted-foreground">
                Detected keywords from your resume. Paste a job description to see your job-match score and missing keywords.
              </p>
            )}

            {result.hasJobDescription && result.missingKeywords.length > 0 && (
              <>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-destructive">
                  Missing ({result.missingKeywords.length})
                </p>
                <div className="mb-3 flex flex-wrap gap-2">
                  {result.missingKeywords.map((kw) => (
                    <span key={kw} className="rounded-lg border border-destructive/25 bg-destructive/10 px-2.5 py-1 text-xs text-destructive">{kw}</span>
                  ))}
                </div>
              </>
            )}
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-success">
              {result.hasJobDescription ? "Matched" : "Detected"}
              {result.matchedKeywords.length > 0 ? ` (${result.matchedKeywords.length})` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {result.matchedKeywords.length > 0 ? (
                result.matchedKeywords.map((kw) => (
                  <span key={kw} className="rounded-lg border border-success/25 bg-success/10 px-2.5 py-1 text-xs text-success">{kw}</span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No strong keywords detected.</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths | Weaknesses */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-5 sm:p-6">
            <SectionTitle icon={CheckCircle2} className="text-success">Strengths</SectionTitle>
            <ul className="space-y-2.5">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-success" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 sm:p-6">
            <SectionTitle icon={AlertTriangle} className="text-warning">Weaknesses</SectionTitle>
            <ul className="space-y-2.5">
              {result.weaknesses.map((w, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-warning" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardContent className="p-5 sm:p-6">
          <SectionTitle icon={Lightbulb}>AI recommendations</SectionTitle>
          <div className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <div key={i} className="rounded-2xl border border-border bg-white/[0.02] p-4">
                <p className="flex gap-3 text-sm font-medium">
                  <span className="grid h-6 w-6 flex-none place-items-center rounded-lg bg-gradient-to-br from-[#7c7ff5] to-[#a855f7] text-[12px] font-bold text-white">
                    {i + 1}
                  </span>
                  {rec.title}
                </p>
                {(rec.before || rec.after) && (
                  <div className="mt-3 grid gap-2.5 text-sm sm:grid-cols-2">
                    {rec.before && (
                      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
                        <p className="mb-1 text-[10.5px] font-medium uppercase tracking-wide text-destructive">Before</p>
                        <p className="text-muted-foreground">{rec.before}</p>
                      </div>
                    )}
                    {rec.after && (
                      <div className="rounded-xl border border-success/20 bg-success/5 p-3">
                        <p className="mb-1 text-[10.5px] font-medium uppercase tracking-wide text-success">After</p>
                        <p>{rec.after}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimized preview */}
      <Card>
        <CardContent className="p-5 sm:p-6">
          <SectionTitle icon={Wand2}>Optimized resume preview</SectionTitle>
          <div className="rounded-2xl border border-border bg-[#0c0e13] p-5">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Professional summary
            </p>
            <p className="text-sm leading-relaxed">{result.optimizedResume.summary}</p>
            <Separator className="my-4" />
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Suggested bullet points
            </p>
            <ul className="space-y-2">
              {result.optimizedResume.bullets.map((b, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <ArrowRight className="mt-0.5 h-4 w-4 flex-none text-primary" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Download CTA */}
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(closest-side,rgba(124,127,245,.16),transparent)]" />
        <CardContent className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-primary/15 text-primary">
              <Gauge className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">Download your full report</p>
              <p className="text-sm text-muted-foreground">Free, no account required — keep a copy of your analysis.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <DownloadReport result={result} />
            {FEATURES.SHAREABLE_RESULTS && <ShareButton result={result} />}
          </div>
        </CardContent>
      </Card>

      {/* Optional account creation */}
      <SaveReportPrompt />
    </div>
  );
}
