import fs from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

type BasePattern = {
  id: string;
  snippet: string;
  score: number;
  confidence: number;
  language: string;
  repo: string;
  file: string;
  tags: string[];
};

type KnowledgeBase = {
  updatedAt: string;
  totalPatterns: number;
  byLanguage: Record<string, number>;
  patterns: BasePattern[];
};

const KN_ROOT = path.resolve(process.env.KNOWLEDGE_ROOT || "H:\\aprendizado ia");
const BASE_FILE = path.join(KN_ROOT, "knowledge-base.json");
const GZIP_FILE = path.join(KN_ROOT, "knowledge-base.json.gz");

async function run(): Promise<void> {
  const maxPatterns = Number(process.env.KNOWLEDGE_MAX_PATTERNS || 250000);
  const raw = await fs.readFile(BASE_FILE, "utf8");
  const base = JSON.parse(raw) as KnowledgeBase;

  const optimizedPatterns = base.patterns
    .slice(0, maxPatterns)
    .map((pattern) => ({
      ...pattern,
      snippet: pattern.snippet.slice(0, 1000)
    }));

  const optimized: KnowledgeBase = {
    ...base,
    totalPatterns: optimizedPatterns.length,
    patterns: optimizedPatterns,
    updatedAt: new Date().toISOString()
  };

  const optimizedRaw = JSON.stringify(optimized);
  const compressed = zlib.gzipSync(Buffer.from(optimizedRaw, "utf8"), { level: 9 });

  await fs.writeFile(BASE_FILE, JSON.stringify(optimized, null, 2), "utf8");
  await fs.writeFile(GZIP_FILE, compressed);

  console.log(
    JSON.stringify({
      totalPatterns: optimized.totalPatterns,
      plainBytes: Buffer.byteLength(optimizedRaw, "utf8"),
      gzipBytes: compressed.byteLength
    })
  );
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
