import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

type RawPattern = {
  repo: string;
  file: string;
  language: string;
  snippet: string;
  extractedAt: string;
  score: number;
};

type RawKnowledge = {
  updatedAt: string;
  patterns: RawPattern[];
};

type RepoHistory = {
  seen: Record<string, string>;
};

type RepoItem = {
  full_name: string;
  clone_url: string;
  stargazers_count: number;
  pushed_at: string;
  size: number;
};

type RepoSearchResponse = {
  items: RepoItem[];
};

const KN_ROOT = path.resolve(process.env.KNOWLEDGE_ROOT || "H:\\aprendizado ia");
const REPOS_DIR = path.join(KN_ROOT, "repos");
const WORKSPACE_DIR = path.join(KN_ROOT, "workspace", "patterns");
const RAW_FILE = path.join(KN_ROOT, "knowledge-raw.json");
const HISTORY_FILE = path.join(KN_ROOT, "repo-history.json");
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "nomic-embed-text";
const GPU_REQUIRED = (process.env.GPU_REQUIRED || "true").toLowerCase() !== "false";

const CODE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".cs",
  ".php",
  ".rb",
  ".md",
  ".yml",
  ".yaml",
  ".json"
]);

function nowIso(): string {
  return new Date().toISOString();
}

function parseArg(name: string, fallback: string): string {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= process.argv.length) {
    return fallback;
  }
  return process.argv[idx + 1];
}

function parseIntArg(name: string, fallback: number): number {
  const value = Number(parseArg(name, String(fallback)));
  return Number.isFinite(value) ? value : fallback;
}

async function ensureDirs(): Promise<void> {
  await fs.mkdir(REPOS_DIR, { recursive: true });
  await fs.mkdir(WORKSPACE_DIR, { recursive: true });
  await fs.mkdir(path.join(KN_ROOT, "archive"), { recursive: true });
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function runCommand(command: string, args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
  return await new Promise((resolve) => {
    const child = spawn(command, args, { windowsHide: true });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("close", (code) => {
      resolve({ stdout, stderr, code: code ?? 1 });
    });
    child.on("error", () => {
      resolve({ stdout, stderr, code: 1 });
    });
  });
}

async function assertGpuReady(): Promise<void> {
  if (!GPU_REQUIRED) {
    return;
  }

  const smi = await runCommand("nvidia-smi", ["--query-gpu=name,utilization.gpu", "--format=csv,noheader"]);
  if (smi.code !== 0 || !smi.stdout.trim()) {
    throw new Error("GPU requerida pero nvidia-smi no esta disponible.");
  }

  const ollamaVersion = await runCommand("ollama", ["--version"]);
  if (ollamaVersion.code !== 0) {
    throw new Error("GPU requerida pero ollama no esta disponible.");
  }

  const list = await runCommand("ollama", ["list"]);
  if (!list.stdout.toLowerCase().includes(OLLAMA_MODEL.toLowerCase())) {
    console.log(`[gpu] modelo ${OLLAMA_MODEL} no encontrado, descargando...`);
    const pull = await runCommand("ollama", ["pull", OLLAMA_MODEL]);
    if (pull.code !== 0) {
      throw new Error(`No se pudo descargar modelo Ollama requerido: ${OLLAMA_MODEL}`);
    }
  }

  await gpuEmbeddingScore("GPU warmup snippet", "text");
  const ps = await runCommand("ollama", ["ps"]);
  if (!ps.stdout.toLowerCase().includes("gpu")) {
    throw new Error("GPU requerida pero Ollama no reporta procesamiento en GPU (ollama ps). Aborto por modo estricto.");
  }
}

async function randomPause(minMs: number, maxMs: number): Promise<void> {
  const duration = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await sleep(duration);
}

async function readJsonSafe<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function repoFolderName(fullName: string): string {
  return fullName.replace(/[\\/:]/g, "__");
}

async function runGitClone(repoUrl: string, targetPath: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn("git", ["clone", "--depth", "1", repoUrl, targetPath], {
      stdio: "ignore",
      windowsHide: true
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`git clone failed with code ${code}`));
    });

    child.on("error", reject);
  });
}

async function searchHighQualityRepos(limit: number): Promise<RepoItem[]> {
  const date = new Date();
  date.setMonth(date.getMonth() - 3);
  const pushedAfter = date.toISOString().slice(0, 10);
  const q = `stars:>500 pushed:>${pushedAfter} archived:false mirror:false`;
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=${Math.min(limit, 50)}`;

  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const payload = (await response.json()) as RepoSearchResponse;
  return payload.items.filter((repo) => repo.size > 50 && repo.size < 400000);
}

async function walkFiles(root: string, maxFiles: number): Promise<string[]> {
  const files: string[] = [];

  async function walk(dir: string): Promise<void> {
    if (files.length >= maxFiles) {
      return;
    }

    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (files.length >= maxFiles) {
        break;
      }

      if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "dist" || entry.name === "build") {
        continue;
      }

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (CODE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        files.push(fullPath);
      }
    }
  }

  await walk(root);
  return files;
}

function detectLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".ts":
    case ".tsx":
      return "typescript";
    case ".js":
    case ".jsx":
      return "javascript";
    case ".py":
      return "python";
    case ".go":
      return "go";
    case ".rs":
      return "rust";
    case ".java":
      return "java";
    case ".cs":
      return "csharp";
    default:
      return "text";
  }
}

function scoreSnippet(text: string): number {
  const signals = ["class ", "interface ", "function ", "async ", "try", "catch", "test", "router", "schema"];
  const lowered = text.toLowerCase();
  return signals.reduce((acc, token) => acc + (lowered.includes(token) ? 1 : 0), 0);
}

async function gpuEmbeddingScore(snippet: string, language: string): Promise<number> {
  const prompt = `[language=${language}]\n${snippet.slice(0, 900)}`;
  const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, keep_alive: "30m" })
  });

  if (!response.ok) {
    throw new Error(`Ollama embeddings error: ${response.status}`);
  }

  const data = (await response.json()) as { embedding?: number[] };
  const emb = data.embedding || [];
  if (!emb.length) {
    return 0;
  }

  // Stable deterministic projection into score range 0..8.
  const energy = emb.slice(0, 64).reduce((acc, val) => acc + Math.abs(val), 0);
  return Math.min(8, Math.floor(energy * 10) % 9);
}

function selectSnippet(content: string): string {
  const lines = content.split(/\r?\n/).slice(0, 40);
  return lines.join("\n").slice(0, 2000);
}

async function extractPatterns(repoName: string, repoRoot: string, maxFiles: number): Promise<RawPattern[]> {
  const files = await walkFiles(repoRoot, maxFiles);
  const patterns: RawPattern[] = [];

  for (const file of files) {
    const content = await fs.readFile(file, "utf8").catch(() => "");
    if (!content.trim()) {
      continue;
    }

    const snippet = selectSnippet(content);
    const lexicalScore = scoreSnippet(snippet);
    if (lexicalScore < 1) {
      continue;
    }

    const language = detectLanguage(file);
    const gpuScore = await gpuEmbeddingScore(snippet, language);
    const score = lexicalScore + gpuScore;
    if (score < 3) {
      continue;
    }

    patterns.push({
      repo: repoName,
      file: path.relative(repoRoot, file),
      language,
      snippet,
      extractedAt: nowIso(),
      score
    });
  }

  return patterns;
}

async function writeWorkspacePatternChunk(patterns: RawPattern[]): Promise<void> {
  const chunkName = `chunk-${Date.now()}.json`;
  const filePath = path.join(WORKSPACE_DIR, chunkName);
  await writeJson(filePath, { createdAt: nowIso(), count: patterns.length, patterns });
}

async function run(): Promise<void> {
  await ensureDirs();
  await assertGpuReady();

  const mode = parseArg("mode", "stable");
  const maxRepos = parseIntArg("maxRepos", mode === "turbo" ? 8 : 3);
  const maxFilesPerRepo = parseIntArg("maxFiles", mode === "turbo" ? 150 : 80);

  const history = await readJsonSafe<RepoHistory>(HISTORY_FILE, { seen: {} });
  const raw = await readJsonSafe<RawKnowledge>(RAW_FILE, { updatedAt: nowIso(), patterns: [] });

  const repos = await searchHighQualityRepos(maxRepos * 3);
  let processed = 0;

  for (const repo of repos) {
    if (processed >= maxRepos) {
      break;
    }

    if (history.seen[repo.full_name]) {
      continue;
    }

    const target = path.join(REPOS_DIR, repoFolderName(repo.full_name));
    const exists = await fs.stat(target).then(() => true).catch(() => false);
    if (!exists) {
      await runGitClone(repo.clone_url, target).catch(() => undefined);
    }

    const available = await fs.stat(target).then(() => true).catch(() => false);
    if (!available) {
      continue;
    }

    const patterns = await extractPatterns(repo.full_name, target, maxFilesPerRepo);
    raw.patterns.push(...patterns);
    history.seen[repo.full_name] = nowIso();
    processed += 1;

    await writeWorkspacePatternChunk(patterns);
    await randomPause(700, 2200);
  }

  raw.updatedAt = nowIso();
  await writeJson(RAW_FILE, raw);
  await writeJson(HISTORY_FILE, history);

  console.log(
    JSON.stringify({
      mode,
      processedRepos: processed,
      maxFilesPerRepo,
      patternsStored: raw.patterns.length,
      knowledgeRoot: KN_ROOT,
      gpuRequired: GPU_REQUIRED,
      ollamaModel: OLLAMA_MODEL
    })
  );
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
