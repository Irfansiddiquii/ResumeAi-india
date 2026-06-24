import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { AnalysisResult } from "@/types/analysis";
import { siteConfig } from "@/config/site";

function scoreColor(v: number): string {
  if (v >= 80) return "#16a34a";
  if (v >= 60) return "#4f46e5";
  if (v >= 40) return "#d97706";
  return "#dc2626";
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 44,
    fontSize: 11,
    color: "#0f172a",
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },
  h1: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  meta: { fontSize: 9, color: "#64748b", marginBottom: 18 },
  h2: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginTop: 18,
    marginBottom: 6,
    color: "#1e293b",
    borderBottomWidth: 1.5,
    borderBottomColor: "#eef2ff",
    paddingBottom: 4,
  },
  scores: { flexDirection: "row", gap: 28, marginVertical: 12 },
  score: { alignItems: "center" },
  scoreVal: { fontSize: 24, fontFamily: "Helvetica-Bold" },
  scoreLabel: { fontSize: 9, color: "#475569", marginTop: 2 },
  li: { flexDirection: "row", marginBottom: 4 },
  bullet: { width: 12 },
  liText: { flex: 1 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 2 },
  tagMissing: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 8,
    fontSize: 9,
    marginRight: 4,
    marginBottom: 4,
  },
  tagMatched: {
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 8,
    fontSize: 9,
    marginRight: 4,
    marginBottom: 4,
  },
  recTitle: { fontFamily: "Helvetica-Bold", marginBottom: 2 },
  before: { color: "#b91c1c", fontSize: 10, marginBottom: 1 },
  after: { color: "#15803d", fontSize: 10, marginBottom: 4 },
  summaryBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 44,
    right: 44,
    textAlign: "center",
    fontSize: 8,
    color: "#94a3b8",
  },
});

function Bulleted({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item, i) => (
        <View style={styles.li} key={i}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.liText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function ReportDocument({ result }: { result: AnalysisResult }) {
  const { scores } = result;
  return (
    <Document
      title={`Resume Analysis Report — ${result.resumeFilename}`}
      author={siteConfig.name}
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Resume Analysis Report</Text>
        <Text style={styles.meta}>
          {result.resumeFilename} · Generated{" "}
          {new Date(result.createdAt).toLocaleString()} · {siteConfig.name}
        </Text>

        <View style={styles.scores}>
          <View style={styles.score}>
            <Text style={[styles.scoreVal, { color: scoreColor(scores.ats) }]}>
              {scores.ats}
            </Text>
            <Text style={styles.scoreLabel}>ATS Score / 100</Text>
          </View>
          <View style={styles.score}>
            <Text
              style={[styles.scoreVal, { color: scoreColor(scores.strength) }]}
            >
              {scores.strength}
            </Text>
            <Text style={styles.scoreLabel}>Resume Strength / 100</Text>
          </View>
          {scores.match !== null && (
            <View style={styles.score}>
              <Text
                style={[styles.scoreVal, { color: scoreColor(scores.match) }]}
              >
                {scores.match}
              </Text>
              <Text style={styles.scoreLabel}>Job Match / 100</Text>
            </View>
          )}
        </View>

        {result.hasJobDescription && (
          <View>
            <Text style={styles.h2}>Missing Keywords</Text>
            <View style={styles.tagRow}>
              {result.missingKeywords.length > 0 ? (
                result.missingKeywords.map((k, i) => (
                  <Text style={styles.tagMissing} key={i}>
                    {k}
                  </Text>
                ))
              ) : (
                <Text style={styles.tagMatched}>None — great coverage!</Text>
              )}
            </View>
          </View>
        )}

        <Text style={styles.h2}>
          {result.hasJobDescription ? "Matched Keywords" : "Detected Keywords"}
        </Text>
        <View style={styles.tagRow}>
          {result.matchedKeywords.map((k, i) => (
            <Text style={styles.tagMatched} key={i}>
              {k}
            </Text>
          ))}
        </View>

        <Text style={styles.h2}>Strengths</Text>
        <Bulleted items={result.strengths} />

        <Text style={styles.h2}>Weaknesses</Text>
        <Bulleted items={result.weaknesses} />

        <Text style={styles.h2}>Improvement Suggestions</Text>
        <View>
          {result.recommendations.map((r, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <Text style={styles.recTitle}>
                {i + 1}. {r.title}
              </Text>
              {r.before && <Text style={styles.before}>Before: {r.before}</Text>}
              {r.after && <Text style={styles.after}>After: {r.after}</Text>}
            </View>
          ))}
        </View>

        <Text style={styles.h2}>Optimized Resume Preview</Text>
        <View style={styles.summaryBox}>
          <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>
            Professional summary
          </Text>
          <Text>{result.optimizedResume.summary}</Text>
        </View>
        <View style={{ marginTop: 8 }}>
          <Bulleted items={result.optimizedResume.bullets} />
        </View>

        <Text style={styles.footer} fixed>
          Created with {siteConfig.name} — free ATS resume checker · {siteConfig.url}
        </Text>
      </Page>
    </Document>
  );
}

export async function buildPdfReport(result: AnalysisResult): Promise<Buffer> {
  return renderToBuffer(<ReportDocument result={result} />);
}
