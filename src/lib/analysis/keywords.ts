/**
 * Keyword extraction, normalization, matching and categorization used by the
 * deterministic scoring engine and as the source of "missing keywords" when no
 * AI key is configured.
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
  "want", "wants", "seeking", "seek", "help", "make", "made",
  "responsibility", "week", "weeks", "time", "part", "full", "remote",
  "onsite", "hybrid", "job", "jobs", "apply", "applicant", "hiring", "hire",
]);

/**
 * Canonical display form for common skill variants. Keys are lowercase raw
 * tokens/phrases; values are the canonical, properly-cased display label.
 * This fixes "React.js / ReactJS / react" all collapsing to "React", etc.
 */
const CANON: Record<string, string> = {
  react: "React", "react.js": "React", reactjs: "React",
  node: "Node.js", "node.js": "Node.js", nodejs: "Node.js",
  next: "Next.js", "next.js": "Next.js", nextjs: "Next.js",
  vue: "Vue", "vue.js": "Vue", vuejs: "Vue",
  angular: "Angular", "angular.js": "Angular", angularjs: "Angular",
  express: "Express", "express.js": "Express",
  js: "JavaScript", javascript: "JavaScript",
  ts: "TypeScript", typescript: "TypeScript",
  golang: "Go", go: "Go",
  postgres: "PostgreSQL", postgresql: "PostgreSQL", psql: "PostgreSQL",
  mongo: "MongoDB", mongodb: "MongoDB",
  k8s: "Kubernetes", kubernetes: "Kubernetes",
  tailwind: "Tailwind", tailwindcss: "Tailwind", "tailwind css": "Tailwind",
  "ci/cd": "CI/CD", cicd: "CI/CD", "ci cd": "CI/CD",
  rest: "REST", restful: "REST", "rest api": "REST API",
  ml: "Machine Learning", "machine learning": "Machine Learning",
  nlp: "NLP", ai: "AI",
  aws: "AWS", gcp: "GCP", azure: "Azure",
  "ui/ux": "UI/UX", ux: "UX", ui: "UI",
  dotnet: ".NET", ".net": ".NET",
  "c#": "C#", "c++": "C++",
  html: "HTML", css: "CSS", sql: "SQL", api: "API", oop: "OOP", tdd: "TDD",
  github: "GitHub", "github actions": "GitHub Actions",
  "power bi": "Power BI", "spring boot": "Spring Boot",
  "data structures": "Data Structures", "data analysis": "Data Analysis",
  "data science": "Data Science", "project management": "Project Management",
  "product management": "Product Management",
};

const ACRONYMS = new Set([
  "aws", "gcp", "sql", "api", "html", "css", "rest", "nlp", "ai", "ml",
  "ci/cd", "ui", "ux", "ui/ux", "oop", "tdd", "seo", "sem", "smm", "crm",
  "erp", "gst", "php", "sap", "etl", "sass", "scss", "json", "xml", "jwt",
  "oauth", "grpc", "qa", "hr", "pmp", "sdlc",
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
  "problem solving", "analytical", "talent acquisition", "employee engagement",
  "performance management", "hr operations", "onboarding",
  "financial modeling", "financial analysis", "financial reporting",
  "valuation", "forecasting", "budgeting", "variance analysis",
  "business strategy", "investor relations", "statistics",
  "data visualization", "user research", "design systems", "social media",
];

const TECH_SET = new Set(TECH_DICTIONARY.filter((t) => !t.includes(" ")));
const TECH_MULTIWORD = TECH_DICTIONARY.filter((t) => t.includes(" "));

// Reverse map: canonical display -> all raw variants (for resume matching).
const VARIANTS: Record<string, string[]> = {};
for (const [raw, disp] of Object.entries(CANON)) {
  (VARIANTS[disp] ??= []).push(raw);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole-word, symbol-aware containment ("java" won't match "javascript"). */
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

/** Pretty, canonical display label for a raw token/phrase. */
function displayOf(raw: string): string {
  const key = raw.toLowerCase();
  if (CANON[key]) return CANON[key];
  if (ACRONYMS.has(key)) return key.toUpperCase();
  return key
    .split(" ")
    .map((w) => (ACRONYMS.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

/** Stable de-dup key so "React", "react.js" and "ReactJS" collapse to one. */
function dedupKey(raw: string): string {
  const key = raw.toLowerCase();
  return (CANON[key] ?? key).toLowerCase();
}

/**
 * Extract canonical, de-duplicated keywords. Combines known multi-word
 * phrases, recurring bigrams, and meaningful unigrams, then normalizes and
 * removes duplicates / phrase-covered unigrams.
 */
export function extractKeywords(text: string, limit = 40): string[] {
  const lower = text.toLowerCase();
  const tokens = tokenize(text);
  const freq = new Map<string, number>();

  for (const term of TECH_MULTIWORD) {
    if (lower.includes(term)) freq.set(term, (freq.get(term) ?? 0) + 6);
  }

  const bigramCounts = new Map<string, number>();
  for (let i = 0; i < tokens.length - 1; i++) {
    if (isMeaningful(tokens[i]) && isMeaningful(tokens[i + 1])) {
      const bg = `${tokens[i]} ${tokens[i + 1]}`;
      bigramCounts.set(bg, (bigramCounts.get(bg) ?? 0) + 1);
    }
  }
  for (const [bg, count] of bigramCounts) {
    if (count >= 2) freq.set(bg, (freq.get(bg) ?? 0) + count * 2 + 2);
  }

  for (const token of tokens) {
    if (!isMeaningful(token)) continue;
    const weight = TECH_SET.has(token) || CANON[token] ? 3 : 1;
    freq.set(token, (freq.get(token) ?? 0) + weight);
  }

  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);

  const result: string[] = [];
  const seen = new Set<string>();
  const coveredByPhrase = new Set<string>();
  for (const raw of sorted) {
    if (result.length >= limit) break;
    const isPhrase = raw.includes(" ");
    const key = dedupKey(raw);
    if (seen.has(key)) continue;
    if (!isPhrase && coveredByPhrase.has(key)) continue;
    seen.add(key);
    if (isPhrase) for (const w of raw.split(" ")) coveredByPhrase.add(dedupKey(w));
    result.push(displayOf(raw));
  }

  return result;
}

/** True if the resume contains a keyword in any of its variant spellings. */
function resumeHasKeyword(resumeLower: string, displayKw: string): boolean {
  const variants = [displayKw.toLowerCase(), ...(VARIANTS[displayKw] ?? [])];
  return variants.some((v) => containsWord(resumeLower, v));
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
  const jdKeywords = extractKeywords(jobDescription, 30); // canonical, de-duped

  const matched: string[] = [];
  const missing: string[] = [];
  for (const kw of jdKeywords) {
    if (resumeHasKeyword(resumeLower, kw)) matched.push(kw);
    else missing.push(kw);
  }

  const total = matched.length + missing.length;
  const matchPercent = total === 0 ? 0 : Math.round((matched.length / total) * 100);
  return { matched, missing, matchPercent };
}

/** Count distinct known skills present in the resume (breadth signal). */
export function countSkills(resumeText: string): number {
  const lower = resumeText.toLowerCase();
  const found = new Set<string>();
  for (const term of TECH_DICTIONARY) {
    if (containsWord(lower, term)) found.add(dedupKey(term));
  }
  return found.size;
}

// ── Skill categorization (area 14) ─────────────────────────────
const CATEGORY_MAP: { category: string; terms: string[] }[] = [
  { category: "Languages", terms: ["javascript", "typescript", "python", "java", "kotlin", "swift", "go", "golang", "rust", "php", "ruby", "scala", "c++", "c#", "r", "dart"] },
  { category: "Frontend", terms: ["react", "angular", "vue", "svelte", "next.js", "redux", "html", "css", "tailwind", "sass", "bootstrap", "jquery"] },
  { category: "Backend", terms: ["node.js", "express", "django", "flask", "fastapi", "spring", "spring boot", "laravel", "rails", ".net", "graphql", "rest", "rest api", "microservices", "grpc"] },
  { category: "Data & DB", terms: ["sql", "mysql", "postgresql", "mongodb", "redis", "cassandra", "dynamodb", "elasticsearch", "oracle", "snowflake", "bigquery"] },
  { category: "Cloud & DevOps", terms: ["docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ansible", "jenkins", "github actions", "ci/cd", "git", "linux", "nginx", "kafka"] },
  { category: "Data & ML", terms: ["tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy", "machine learning", "deep learning", "nlp", "data analysis", "data science", "spark", "hadoop", "tableau", "power bi", "excel"] },
  { category: "Design", terms: ["figma", "sketch", "adobe xd", "photoshop", "illustrator", "ui/ux", "wireframing", "prototyping", "user research", "design systems"] },
  { category: "Business", terms: ["salesforce", "sap", "seo", "sem", "crm", "erp", "marketing", "sales", "finance", "accounting", "project management", "product management", "leadership", "communication", "talent acquisition", "employee engagement", "performance management", "hr operations", "recruitment", "payroll", "financial modeling", "financial analysis", "valuation", "forecasting", "budgeting", "business strategy", "content marketing", "email marketing", "digital marketing", "social media", "google ads", "google analytics", "copywriting", "stakeholder management"] },
];

export function categorizeSkill(displayKw: string): string {
  const key = displayKw.toLowerCase();
  for (const { category, terms } of CATEGORY_MAP) {
    if (terms.includes(key) || terms.includes(CANON[key]?.toLowerCase() ?? key)) {
      return category;
    }
  }
  return "Other";
}

/** Sort keywords so related skills group together (Languages, Frontend, …). */
export function sortByCategory(keywords: string[]): string[] {
  const order = CATEGORY_MAP.map((c) => c.category).concat("Other");
  return [...keywords].sort(
    (a, b) => order.indexOf(categorizeSkill(a)) - order.indexOf(categorizeSkill(b))
  );
}
