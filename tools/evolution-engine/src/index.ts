import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

type Phase = "turbo" | "stable" | "infinite";

type EvolutionState = {
  initializedAt: string;
  lastCycleAt?: string;
  lastNightlyCleanAt?: string;
  lastWeeklyCleanAt?: string;
  lastMonthlyOptimizationAt?: string;
  lastArchiveAt?: string;
  phaseOverride?: Phase;
};

const ROOT = path.resolve(process.cwd(), "..", "..");
const KN_ROOT = path.resolve(process.env.KNOWLEDGE_ROOT || "H:\\aprendizado ia");
const STATE_FILE = path.join(KN_ROOT, "evolution-state.json");
const RAW_FILE = path.join(KN_ROOT, "knowledge-raw.json");
const ARCHIVE_DIR = path.join(KN_ROOT, "archive");

function nowIso(): string {
  return new Date().toISOString();
}

async function ensureRoot(): Promise<void> {
  await fs.mkdir(KN_ROOT, { recursive: true });
  await fs.mkdir(ARCHIVE_DIR, { recursive: true });
}

async function readState(): Promise<EvolutionState> {
  try {
    const raw = await fs.readFile(STATE_FILE, "utf8");
    return JSON.parse(raw) as EvolutionState;
  } catch {
    return { initializedAt: nowIso() };
  }
}

async function saveState(state: EvolutionState): Promise<void> {
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

function diffDays(fromIso: string): number {
  const diffMs = Date.now() - new Date(fromIso).getTime();
  return diffMs / (1000 * 60 * 60 * 24);
}

function resolvePhase(state: EvolutionState): Phase {
  if (state.phaseOverride) {
    return state.phaseOverride;
  }

  const days = diffDays(state.initializedAt);
  if (days < 5) return "turbo";
  if (days < 180) return "stable";
  return "infinite";
}

function shouldRun(lastIso: string | undefined, intervalHours: number): boolean {
  if (!lastIso) return true;
  const diffMs = Date.now() - new Date(lastIso).getTime();
  return diffMs >= intervalHours * 60 * 60 * 1000;
}

function shouldRunDays(lastIso: string | undefined, days: number): boolean {
  if (!lastIso) return true;
  const diffMs = Date.now() - new Date(lastIso).getTime();
  return diffMs >= days * 24 * 60 * 60 * 1000;
}

async function runWorkspaceTool(workspace: string, args: string[] = []): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn("npm", ["--workspace", workspace, "run", "run", "--", ...args], {
      cwd: ROOT,
      stdio: "inherit",
      windowsHide: true,
      shell: true
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Tool ${workspace} failed with ${code}`));
      }
    });
  });
}

async function archiveRawIfDue(state: EvolutionState): Promise<void> {
  if (!shouldRunDays(state.lastArchiveAt, 7)) {
    return;
  }

  const exists = await fs.stat(RAW_FILE).then(() => true).catch(() => false);
  if (!exists) {
    return;
  }

  const target = path.join(ARCHIVE_DIR, `knowledge-raw-${Date.now()}.json`);
  await fs.copyFile(RAW_FILE, target);
  state.lastArchiveAt = nowIso();
}

async function runCycle(): Promise<void> {
  await ensureRoot();
  const state = await readState();
  const phase = resolvePhase(state);

  const intervalHours = phase === "turbo" ? 1 : 8;
  if (!shouldRun(state.lastCycleAt, intervalHours)) {
    console.log(JSON.stringify({ phase, skipped: true, reason: "cycle-not-due", knowledgeRoot: KN_ROOT }));
    return;
  }

  if (phase === "turbo") {
    await runWorkspaceTool("tools/local-learning-engine", ["--mode", "turbo", "--maxRepos", "6", "--maxFiles", "150"]);

    if (shouldRun(state.lastNightlyCleanAt, 24)) {
      await runWorkspaceTool("tools/knowledge-cleaner");
      await runWorkspaceTool("tools/knowledge-compressor");
      state.lastNightlyCleanAt = nowIso();
    }
  } else {
    await runWorkspaceTool("tools/local-learning-engine", ["--mode", "stable", "--maxRepos", "3", "--maxFiles", "80"]);

    await runWorkspaceTool("tools/knowledge-cleaner");
    await runWorkspaceTool("tools/knowledge-compressor");

    if (shouldRunDays(state.lastWeeklyCleanAt, 7)) {
      await runWorkspaceTool("tools/knowledge-rotator");
      state.lastWeeklyCleanAt = nowIso();
    }

    if (shouldRunDays(state.lastMonthlyOptimizationAt, 30)) {
      await runWorkspaceTool("tools/long-term-memory");
      state.lastMonthlyOptimizationAt = nowIso();
    }
  }

  await archiveRawIfDue(state);
  state.lastCycleAt = nowIso();

  await saveState(state);
  console.log(JSON.stringify({ phase, updatedAt: state.lastCycleAt, knowledgeRoot: KN_ROOT }));
}

runCycle().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
