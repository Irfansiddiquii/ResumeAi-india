import type { AnalysisResult } from "@/types/analysis";
import { siteConfig } from "@/config/site";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function scoreColor(v: number): string {
  if (v >= 80) return "#16a34a";
  if (v >= 60) return "#4f46e5";
  if (v >= 40) return "#d97706";
  return "#dc2626";
}

function list(items: string[]): string {
  return items.map((i) => `<li>${esc(i)}</li>`).join("");
}

/** Self-contained, printable HTML report (no external assets). */
export function buildHtmlReport(
  result: AnalysisResult,
  baseUrl: string = siteConfig.url
): string {
  const { scores } = result;
  const scoreCard = (label: string, value: number) => `
    <div class="score">
      <div class="ring" style="color:${scoreColor(value)}">${value}<span>/100</span></div>
      <div class="score-label">${esc(label)}</div>
    </div>`;

  const recs = result.recommendations
    .map(
      (r, i) => `
      <li>
        <strong>${i + 1}. ${esc(r.title)}</strong>
        ${
          r.before || r.after
            ? `<div class="ba">
                ${r.before ? `<div class="before"><em>Before:</em> ${esc(r.before)}</div>` : ""}
                ${r.after ? `<div class="after"><em>After:</em> ${esc(r.after)}</div>` : ""}
              </div>`
            : ""
        }
      </li>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Resume Analysis Report — ${esc(siteConfig.name)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; background: #f8fafc; }
  .sheet { max-width: 800px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; }
  h1 { font-size: 24px; margin: 0 0 4px; }
  h2 { font-size: 16px; margin: 28px 0 10px; border-bottom: 2px solid #eef2ff; padding-bottom: 6px; color: #1e293b; }
  .muted { color: #64748b; font-size: 13px; }
  .scores { display: flex; gap: 24px; margin: 20px 0; flex-wrap: wrap; }
  .score { text-align: center; }
  .ring { font-size: 30px; font-weight: 700; }
  .ring span { font-size: 13px; color: #94a3b8; font-weight: 500; }
  .score-label { font-size: 13px; color: #475569; margin-top: 2px; }
  ul { margin: 0; padding-left: 18px; }
  li { margin: 6px 0; font-size: 14px; }
  .tags span { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; margin: 3px 4px 3px 0; }
  .missing span { background: #fef2f2; color: #dc2626; }
  .matched span { background: #f0fdf4; color: #16a34a; }
  .ba { margin: 6px 0 4px; font-size: 13px; }
  .before { color: #b91c1c; } .after { color: #15803d; }
  .summary { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; font-size: 14px; }
  .footer { margin-top: 32px; font-size: 12px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
  <div class="sheet">
    <h1>Resume Analysis Report</h1>
    <p class="muted">${esc(result.resumeFilename)} · Generated ${new Date(
      result.createdAt
    ).toLocaleString()} · ${esc(siteConfig.name)}</p>

    <div class="scores">
      ${scoreCard("ATS Score", scores.ats)}
      ${scoreCard("Resume Strength", scores.strength)}
      ${scores.match !== null ? scoreCard("Job Match", scores.match) : ""}
    </div>

    ${
      result.hasJobDescription
        ? `<h2>Missing Keywords</h2>
           <div class="tags missing">${
             result.missingKeywords.length
               ? result.missingKeywords.map((k) => `<span>${esc(k)}</span>`).join("")
               : '<span style="background:#f0fdf4;color:#16a34a">None — great coverage!</span>'
           }</div>`
        : ""
    }

    <h2>${result.hasJobDescription ? "Matched Keywords" : "Detected Keywords"}</h2>
    <div class="tags matched">${result.matchedKeywords
      .map((k) => `<span>${esc(k)}</span>`)
      .join("")}</div>

    <h2>Strengths</h2>
    <ul>${list(result.strengths)}</ul>

    <h2>Weaknesses</h2>
    <ul>${list(result.weaknesses)}</ul>

    <h2>Improvement Suggestions</h2>
    <ul>${recs}</ul>

    <h2>Optimized Resume Preview</h2>
    <div class="summary">
      <strong>Professional summary</strong>
      <p style="margin:8px 0 0">${esc(result.optimizedResume.summary)}</p>
    </div>
    <h2 style="border:none;margin-bottom:6px">Suggested bullet points</h2>
    <ul>${list(result.optimizedResume.bullets)}</ul>

    <div class="footer">
      Created with ${esc(siteConfig.name)} — free ATS resume checker. ${esc(
        baseUrl
      )}
    </div>
  </div>
</body>
</html>`;
}
