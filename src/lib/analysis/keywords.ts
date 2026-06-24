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
  "role", "responsibility", "including", "etc", " etc", "month", "day",
  "days", "week", "weeks", "time", "part", "full", "remote", "onsite",
  "hybrid", "job", "jobs", "apply", "applicant", "hiring", "hire",
]);

const TECH_DICTIONARY = [
  // Languages
  "javascript", "typescript", "python", "java", "kotlin", "swift", "golang",
  "go", "rust", "php", "ruby", "scala", "perl", "objective-c", "dart",
  "c++", "c#", "matlab", "r",
  // Frontend
  "react", "angular", "vue", "svelte", "next.js", "nuxt", "redux", "html",
  "css", "tailwind", "sass", "bootstrap", "jquery", "webpack", "vite",
  "react native", "flutter",
  // Backend / frameworks
  "node.js", "express", "django", "flask", "fastapi", "spring", "spring boot",
  "laravel", "rails", "hibernate", "dotnet", ".net", "graphql", "rest",
  "rest api", "grpc", "microservices", "api",
  // Data / DB
  "sql", "mysql", "postgresql", "mongodb", "redis", "cassandra", "dynamodb",
  "elasticsearch", "oracle", "sql server", "sqlite", "snowflake", "bigquery",
  // DevOps / cloud
  "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ansible",
  "jenkins", "github actions", "gitlab", "ci/cd", "git", "linux", "nginx",
  "kafka", "rabbitmq", "celery", "prometheus", "grafana",
  // Data science / ML
  "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
  "machine learning", "deep learning", "nlp", "computer vision",
  "data analysis", "data science", "data structures", "algorithms",
  "spark", "hadoop", "airflow", "etl", "tableau", "power bi", "excel",
  // Methodologies
  "agile", "scrum", "kanban", "jira", "devops", "tdd", "oop",
  // Design
  "figma", "sketch", "adobe xd", "photoshop", "illustrator", "ui/ux",
  "wireframing", "prototyping",
  // Business / marketing / finance (India-relevant)
  "salesforce", "sap", "seo", "sem", "smm", "crm", "erp", "google analytics",
  "google ads", "content marketing", "email marketing", "digital marketing",
  "copywriting", "marketing", "sales", "business development", "accounting",
  "finance", "financial modeling", "taxation", "gst", "tally", "auditing",
  "recruitment", "payroll", "project management", "product management",
  "stakeholder management", "communication", "leadership", "teamwork",
  "problem solving", "analytical",
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
    .filter(Boolean)
    .map((t) => t.replace(/^[-.]+|[-.]+$/g, ""));
}

function isMeaningful(word: string): boolean {
  return word.length >= 3 && !STOP_WORDS.has(word) && !/^[\d.]+$/.test(word);
}

/**
 * Extract candidate keywords. Combines:
 *  - known multi-word tech/business phrases,
 *  - recurring bigrams found in the text (e.g. "project management"),
 *  - meaningful unigrams,
 * then de-duplicates unigrams already represented by a chosen phrase.
 */
export function extractKeywords(text: string, limit = 40): string[] {
  const lower = text.toLowerCase();
  const tokens = tokenize(text);
  const freq = new Map<string, number>();

  // 1) Known multi-word phrases (whole-phrase match) — weighted highest.
  for (const term of TECH_MULTIWORD) {
    if (lower.includes(term)) freq.set(term, (freq.get(term) ?? 0) + 6);
  }

  // 2) Recurring bigrams from genuinely adjacent meaningful tokens.
  const bigramCounts = new Map<string, number>();
  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    if (isMeaningful(a) && isMeaningful(b)) {
      const bg = `${a} ${b}`;
      bigramCounts.set(bg, (bigramCounts.get(bg) ?? 0) + 1);
    }
  }
  for (const [bg, count] of bigramCounts) {
    if (count >= 2) freq.set(bg, (freq.get(bg) ?? 0) + count * 2 + 2);
  }

  // 3) Meaningful unigrams (tech terms weighted higher).
  for (const token of tokens) {
    if (!isMeaningful(token)) continue;
    const weight = TECH_SET.has(token) ? 3 : 1;
    freq.set(token, (freq.get(token) ?? 0) + weight);
  }

  const sorted = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);

  // 4) De-duplicate: drop a unigram if a higher-ranked phrase already covers it.
  const result: string[] = [];
  const coveredByPhrase = new Set<string>();
  for (const k of sorted) {
    if (result.length >= limit) break;
    if (k.includes(" ")) {
      result.push(k);
      for (const w of k.split(" ")) coveredByPhrase.add(w);
    } else if (!coveredByPhrase.has(k)) {
      result.push(k);
    }
  }

  return result;
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
