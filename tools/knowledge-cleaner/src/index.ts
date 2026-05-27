import fs from "node:fs/promises";
import path from "node:path";

type RawPattern = {
  repo: string;
  file: string;
  language: string;
  snippet: string;
  extractedAt: string;
  score: number;
};

type KnowledgeBase = {
  updatedAt: string;
  totalPatterns: number;
  byLanguage: Record<string, number>;
  patterns: Array<{
    id: string;
    repo: string;
    file: string;
    language: string;
    snippet: string;
    score: number;
    confidence: number;
    tags: string[];
  }>;
};

const KN_ROOT = path.resolve(process.env.KNOWLEDGE_ROOT || "H:\\aprendizado ia");
const RAW_FILE = path.join(KN_ROOT, "knowledge-raw.json");
const BASE_FILE = path.join(KN_ROOT, "knowledge-base.json");

function nowIso(): string {
  return new Date().toISOString();
}

function tagPattern(snippet: string): string[] {
  const tags: string[] = [];
  const lowered = snippet.toLowerCase();
  if (lowered.includes("test") || lowered.includes("describe(")) tags.push("testing");
  if (lowered.includes("router") || lowered.includes("endpoint")) tags.push("api");
  if (lowered.includes("class ") || lowered.includes("interface ")) tags.push("architecture");
  if (lowered.includes("try") && lowered.includes("catch")) tags.push("error-handling");
  return tags.length ? tags : ["general"];
}

function compressSnippet(snippet: string): string {
  return snippet
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line, idx, arr) => line || (idx > 0 && arr[idx - 1]))
    .join("\n")
    .slice(0, 1200);
}

async function run(): Promise<void> {
  const raw = JSON.parse(await fs.readFile(RAW_FILE, "utf8")) as { patterns: RawPattern[] };

  const seen = new Set<string>();
  const patterns = raw.patterns
    .filter((pattern) => pattern.score >= 1)
    .filter((pattern) => {
      const key = `${pattern.repo}::${pattern.file}::${pattern.snippet.slice(0, 200)}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .map((pattern, index) => ({
      id: `p-${index + 1}`,
      repo: pattern.repo,
      file: pattern.file,
      language: pattern.language,
      snippet: compressSnippet(pattern.snippet),
      score: pattern.score,
      confidence: Math.min(1, pattern.score / 7),
      tags: tagPattern(pattern.snippet)
    }))
    .sort((a, b) => b.score - a.score);

  const byLanguage: Record<string, number> = {};
  for (const pattern of patterns) {
    byLanguage[pattern.language] = (byLanguage[pattern.language] || 0) + 1;
  }

  const cleaned: KnowledgeBase = {
    updatedAt: nowIso(),
    totalPatterns: patterns.length,
    byLanguage,
    patterns
  };

  await fs.mkdir(KN_ROOT, { recursive: true });
  await fs.writeFile(BASE_FILE, JSON.stringify(cleaned, null, 2), "utf8");

  console.log(JSON.stringify({ knowledgeBase: BASE_FILE, totalPatterns: cleaned.totalPatterns }));
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
