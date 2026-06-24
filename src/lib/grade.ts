export type GradeTone = "success" | "cyan" | "warning" | "destructive";

export interface Grade {
  letter: string;
  label: string;
  tone: GradeTone;
}

/** Map an overall ATS score (0–100) to a resume grade. */
export function getGrade(score: number): Grade {
  if (score >= 90) return { letter: "A+", label: "Excellent resume", tone: "success" };
  if (score >= 80) return { letter: "A", label: "Strong resume", tone: "success" };
  if (score >= 70) return { letter: "B", label: "Good — almost there", tone: "cyan" };
  if (score >= 55) return { letter: "C", label: "Needs some work", tone: "warning" };
  return { letter: "D", label: "Major issues to fix", tone: "destructive" };
}

export const GRADE_SCALE: { letter: string; range: string; min: number }[] = [
  { letter: "D", range: "0–54", min: 0 },
  { letter: "C", range: "55–69", min: 55 },
  { letter: "B", range: "70–79", min: 70 },
  { letter: "A", range: "80–89", min: 80 },
  { letter: "A+", range: "90–100", min: 90 },
];

/** Which scale segment is active for a given score. */
export function activeGradeIndex(score: number): number {
  if (score >= 90) return 4;
  if (score >= 80) return 3;
  if (score >= 70) return 2;
  if (score >= 55) return 1;
  return 0;
}
