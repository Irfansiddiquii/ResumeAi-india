import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  KeyRound,
  Wand2,
  Sparkles,
  ArrowRight,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScoreRing } from "@/components/result/score-ring";
import { DownloadReport } from "@/components/result/download-report";
import { ShareButton } from "@/components/result/share-button";
import { FEATURES } from "@/lib/features";
import { SaveReportPrompt } from "@/components/result/save-report-prompt";
import type { AnalysisResult } from "@/types/analysis";

export function ResultView({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Your resume analysis
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.resumeFilename}
            <span className="mx-2">·</span>
            <Badge variant={result.engine === "gemini" ? "default" : "secondary"}>
              {result.engine === "gemini" ? (
                <>
                  <Sparkles className="mr-1 h-3 w-3" /> AI analysis
                </>
              ) : (
                "Instant analysis"
              )}
            </Badge>
          </p>
        </div>
      </div>

      {/* Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-around gap-6">
            <ScoreRing value={result.scores.ats} label="ATS Score" />
            <ScoreRing value={result.scores.strength} label="Resume Strength" />
            {result.scores.match !== null ? (
              <ScoreRing value={result.scores.match} label="Job Match" />
            ) : (
              <div className="flex max-w-[180px] flex-col items-center text-center">
                <div className="flex h-[132px] items-center justify-center">
                  <Target />
                </div>
                <p className="text-xs text-muted-foreground">
                  Add a job description to see your job-match score.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" /> Keywords
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {result.hasJobDescription && (
            <div>
              <p className="mb-2 text-sm font-medium text-destructive">
                Missing keywords ({result.missingKeywords.length})
              </p>
              {result.missingKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((kw) => (
                    <Badge key={kw} variant="destructive">
                      {kw}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Great — no important keywords missing.
                </p>
              )}
            </div>
          )}
          <div>
            <p className="mb-2 text-sm font-medium text-success">
              {result.hasJobDescription ? "Matched keywords" : "Detected keywords"}
            </p>
            <div className="flex flex-wrap gap-2">
              {result.matchedKeywords.length > 0 ? (
                result.matchedKeywords.map((kw) => (
                  <Badge key={kw} variant="success">
                    {kw}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No strong keywords detected.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & weaknesses */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" /> Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" /> Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.weaknesses.map((w, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" /> Improvement suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="rounded-lg border bg-muted/30 p-4">
                <p className="flex gap-2 text-sm font-medium">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">
                    {i + 1}
                  </span>
                  {rec.title}
                </p>
                {(rec.before || rec.after) && (
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    {rec.before && (
                      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2">
                        <p className="mb-1 text-xs font-medium text-destructive">
                          Before
                        </p>
                        <p className="text-muted-foreground">{rec.before}</p>
                      </div>
                    )}
                    {rec.after && (
                      <div className="rounded-md border border-success/30 bg-success/5 p-2">
                        <p className="mb-1 text-xs font-medium text-success">
                          After
                        </p>
                        <p>{rec.after}</p>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Optimized preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" /> Optimized resume preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Professional summary
            </p>
            <p className="text-sm leading-relaxed">
              {result.optimizedResume.summary}
            </p>
          </div>
          <Separator />
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Suggested bullet points
            </p>
            <ul className="space-y-2">
              {result.optimizedResume.bullets.map((b, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Download */}
      <Card className="bg-primary/5">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Download your full report</p>
            <p className="text-sm text-muted-foreground">
              Free, no account required — keep a copy of your analysis.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
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
