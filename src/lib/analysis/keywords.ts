/**
 * Lightweight keyword extraction + matching used by the deterministic scoring
 * engine and as the source of "missing keywords" when no AI key is configured.
 */

const STOP_WORDS = new Set([
  // Common English stopwords
  "the", "and", "for", "are", "but", "not", "you", "all", "any", "can", "had",
  "her", "was", "one", "our", "out", "day", "get", "has", "him", "his", "how",
  "man", "new", "now", "old", "see", "two", "way", "who", "boy", "did", "its",
  "let", "put", "say", "she", "too", "use", "with", "this", "that", "from",
  "your", "have", "will", "they", "their", "them", "into", "over", "such",
  "than", "then", "were", "what", "when", "which", "while", "would", "about",
  "after", "again", "being", "could", "every", "other", "some", "these",
  "those", "under", "where",
  // Resume/JD filler that is not a real skill keyword
  "work", "working", "worked", "role", "roles", "team", "teams", "year",
  "years", "month", "months", "etc", "via", "using", "across", "within",
  "able", "also", "based", "including", "include", "responsible",
  "responsibilities", "experience", "experienced", "skills", "skill",
  "knowledge", "ability", "abilities", "strong", "good", "excellent",
  "various", "senior", "junior", "lead", "looking", "candidate", "candidates",
  "preferred", "required", "require", "requires", "must", "need", "needs",
  "plus", "ideal", "proven", "track", "record", "join", "joining", "position",
  "opportunity", "company", "companies", "skilled", "expertise", "proficient",
  "proficiency", "familiar", "familiarity", "understanding", "passionate",
  "motivated", "detail", "oriented", "self", "great", "best", "well",
  "want", "wants", "seeking", "seek", "help", "make", "made", "join",
]);

const TECH_DICTIONARY = [
  "javascript", "typescript", "python", "java", "kotlin", "swift", "golang",
  "rust", "php", "ruby", "react", "angular", "vue", "next.js", "node.js",
  "express", "django", "flask", "spring", "laravel", "rails", "sql", "mysql",
  "postgresql", "mongodb", "redis", "kafka", "rabbitmq", "graphql", "rest",
  "api", "microservices", "docker", "kubernetes", "aws", "azure", "gcp",
  "terraform", "jenkins", "ci/cd", "git", "linux", "agile", "scrum", "jira",
  "html", "css", "tailwind", "sass", "redux", "figma", "tensorflow", "pytorch",
  "machine learning", "deep learning", "nlp", "data analysis", "pandas",
  "numpy", "excel", "power bi", "tableau", "salesforce", "sap", "seo", "sem",
  "marketing", "sales", "accounting", "finance", "communication", "leadership",
];

// O(1) lookups for single-word tech terms.
const TECH_SET = new Set(TECH_DICTIONARY.filter((t) => !t.includes(" ")));
const TECH_MULTIWORD = TECH_DICTIONARY.filter((t) => t.includes(" "));

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Whole-word containment check that is symbol-aware. Prevents false positives
 * such as "java" matching inside "javascript" or "sql" inside "postgresql",
 * while still matching tokens that contain symbols like "node.js", "ci/cd"
 * or "c++". The boundary is "not an alphanumeric character".
 */
export function containsWord(haystackLower: string, termLower: string): boolean {
  if (!termLower) return false;
  const re = new RegExp(`(?<![a-z0-9])${escapeRegExp(termLower)}(?![a-z0-9])`);
  return re.test(haystackLower);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9.+#/\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Extract candidate keywords (uni-grams + known multi-word tech terms). */
export function extractKeywords(text: string, limit = 40): string[] {
  const lower = text.toLowerCase();
  const freq = new Map<string, number>();

  // Known multi-word terms first (whole-phrase match).
  for (const term of TECH_MULTIWORD) {
    if (lower.includes(term)) {
      freq.set(term, (freq.get(term) ?? 0) + 3);
    }
  }

  for (const token of tokenize(text)) {
    const word = token.replace(/^[-.]+|[-.]+$/g, "");
    if (word.length < 3 || STOP_WORDS.has(word) || /^\d+$/.test(word)) continue;
    const weight = TECH_SET.has(word) ? 3 : 1;
    freq.set(word, (freq.get(word) ?? 0) + weight);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

export interface KeywordMatch {
  matched: string[];
  missing: string[];
  matchPercent: number;
}

/** Compare a job description's keywords against the resume text. */
export function matchKeywords(
  resumeText: string,
  jobDescription: string
): KeywordMatch {
  const resumeLower = resumeText.toLowerCase();
  const jdKeywords = extractKeywords(jobDescription, 30);

  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of jdKeywords) {
    // Whole-word match avoids "java" matching "javascript", etc.
    if (containsWord(resumeLower, kw)) matched.push(kw);
    else missing.push(kw);
  }

  const total = matched.length + missing.length;
  const matchPercent =
    total === 0 ? 0 : Math.round((matched.length / total) * 100);

  return { matched, missing, matchPercent };
}
