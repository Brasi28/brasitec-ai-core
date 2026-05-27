import fs from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

type KnowledgeBase = {
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
const BASE_FILE = path.join(KN_ROOT, "knowledge-base.json");
const MEMORY_FILE = path.join(KN_ROOT, "long-term-memory.json");
const MEMORY_COMPRESSED = path.join(KN_ROOT, "long-term-memory.json.gz");

async function run(): Promise<void> {
  const raw = await fs.readFile(BASE_FILE, "utf8");
  const base = JSON.parse(raw) as KnowledgeBase;

  const stable = base.patterns
    .filter((pattern) => pattern.confidence >= 0.55)
    .map((pattern) => ({
      id: pattern.id,
      repo: pattern.repo,
      file: pattern.file,
      language: pattern.language,
      snippet: pattern.snippet,
      tags: pattern.tags,
      score: pattern.score,
      confidence: pattern.confidence,
      stableAt: new Date().toISOString()
    }));

  const memory = {
    updatedAt: new Date().toISOString(),
    stableCount: stable.length,
    architectures: stable.filter((item) => item.tags.includes("architecture")).slice(0, 3000),
    optimalSolutions: stable.filter((item) => item.tags.includes("error-handling") || item.tags.includes("api")).slice(0, 3000),
    stablePatterns: stable
  };

  const serialized = JSON.stringify(memory);
  await fs.writeFile(MEMORY_FILE, JSON.stringify(memory, null, 2), "utf8");
  await fs.writeFile(MEMORY_COMPRESSED, zlib.gzipSync(Buffer.from(serialized, "utf8")));

  console.log(JSON.stringify({ stableCount: memory.stableCount, memoryFile: MEMORY_FILE }));
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
