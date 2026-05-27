import fs from "node:fs/promises";
import path from "node:path";
import { resolveWorkspacePath } from "../utils/paths";

type FileCounter = Record<string, number>;

async function walk(dir: string, counter: FileCounter, depth: number): Promise<void> {
  if (depth > 4) {
    return;
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, counter, depth + 1);
      continue;
    }

    const ext = path.extname(entry.name) || "[no-ext]";
    counter[ext] = (counter[ext] || 0) + 1;
  }
}

export async function analyzeProject(rawRootPath: string): Promise<{
  rootPath: string;
  fileTypes: FileCounter;
  signals: string[];
}> {
  const rootPath = resolveWorkspacePath(rawRootPath);
  const fileTypes: FileCounter = {};
  await walk(rootPath, fileTypes, 0);

  const signals: string[] = [];
  const files = await fs.readdir(rootPath).catch(() => [] as string[]);
  if (files.includes("package.json")) signals.push("node-project");
  if (files.includes("pyproject.toml") || files.includes("requirements.txt")) signals.push("python-project");
  if (files.includes(".git")) signals.push("git-repository");

  return { rootPath, fileTypes, signals };
}
