import fs from "node:fs/promises";
import path from "node:path";

type KnowledgeBase = {
  updatedAt: string;
  totalPatterns: number;
  patterns: Array<{ score: number; confidence: number }>;
};

const KN_ROOT = path.resolve(process.env.KNOWLEDGE_ROOT || "H:\\aprendizado ia");
const ARCHIVE_DIR = path.join(KN_ROOT, "archive");
const BASE_FILE = path.join(KN_ROOT, "knowledge-base.json");
const WORKSPACE_PATTERNS = path.join(KN_ROOT, "workspace", "patterns");

function sizeMb(bytes: number): number {
  return Math.round((bytes / (1024 * 1024)) * 100) / 100;
}

async function getDirectorySize(dir: string): Promise<number> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  let total = 0;
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      total += await getDirectorySize(fullPath);
    } else {
      const stat = await fs.stat(fullPath).catch(() => null);
      total += stat?.size || 0;
    }
  }
  return total;
}

async function rotateWorkspaceChunks(maxBytes: number): Promise<number> {
  const entries = await fs.readdir(WORKSPACE_PATTERNS, { withFileTypes: true }).catch(() => []);
  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map(async (entry) => {
        const fullPath = path.join(WORKSPACE_PATTERNS, entry.name);
        const stat = await fs.stat(fullPath);
        return { fullPath, mtimeMs: stat.mtimeMs, size: stat.size };
      })
  );

  files.sort((a, b) => a.mtimeMs - b.mtimeMs);
  let total = files.reduce((acc, file) => acc + file.size, 0);
  let archived = 0;

  await fs.mkdir(ARCHIVE_DIR, { recursive: true });

  for (const file of files) {
    if (total <= maxBytes) {
      break;
    }

    const target = path.join(ARCHIVE_DIR, `workspace-${path.basename(file.fullPath)}`);
    await fs.rename(file.fullPath, target).catch(async () => {
      await fs.copyFile(file.fullPath, target);
      await fs.unlink(file.fullPath);
    });
    total -= file.size;
    archived += 1;
  }

  return archived;
}

async function rotateKnowledgeBase(maxPatterns: number): Promise<number> {
  const raw = await fs.readFile(BASE_FILE, "utf8").catch(() => "");
  if (!raw) {
    return 0;
  }

  const base = JSON.parse(raw) as KnowledgeBase;
  if (base.patterns.length <= maxPatterns) {
    return 0;
  }

  const removed = base.patterns.length - maxPatterns;
  const removedChunk = base.patterns.slice(maxPatterns);
  base.patterns = base.patterns.slice(0, maxPatterns);
  base.totalPatterns = base.patterns.length;
  base.updatedAt = new Date().toISOString();

  await fs.mkdir(ARCHIVE_DIR, { recursive: true });
  const archivePath = path.join(ARCHIVE_DIR, `rotated-patterns-${Date.now()}.json`);
  await fs.writeFile(archivePath, JSON.stringify({ removed: removedChunk }, null, 2), "utf8");
  await fs.writeFile(BASE_FILE, JSON.stringify(base, null, 2), "utf8");

  return removed;
}

async function run(): Promise<void> {
  const workspaceMaxMb = Number(process.env.WORKSPACE_PATTERNS_MAX_MB || 2048);
  const maxPatterns = Number(process.env.KNOWLEDGE_MAX_PATTERNS || 250000);

  const archivedWorkspaceFiles = await rotateWorkspaceChunks(workspaceMaxMb * 1024 * 1024);
  const rotatedPatterns = await rotateKnowledgeBase(maxPatterns);

  const workspaceSize = await getDirectorySize(WORKSPACE_PATTERNS);
  const kbSize = await fs.stat(BASE_FILE).then((s) => s.size).catch(() => 0);

  console.log(
    JSON.stringify({
      archivedWorkspaceFiles,
      rotatedPatterns,
      workspacePatternsMb: sizeMb(workspaceSize),
      knowledgeBaseMb: sizeMb(kbSize)
    })
  );
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
