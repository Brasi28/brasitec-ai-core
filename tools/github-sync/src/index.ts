import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const KN_ROOT = path.resolve(process.env.KNOWLEDGE_ROOT || "H:\\aprendizado ia");
const BASE_FILE = path.join(KN_ROOT, "knowledge-base.json");
const MAX_SYNC_MB = Number(process.env.SYNC_MAX_MB || 50);

function runGit(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", args, { stdio: "inherit", windowsHide: true });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`git ${args.join(" ")} exited with ${code}`));
      }
    });
  });
}

async function run(): Promise<void> {
  const allow = process.argv.includes("--allow");
  if (!allow) {
    throw new Error("Se requiere --allow para habilitar sincronizacion.");
  }

  const exists = await fs.stat(BASE_FILE).then(() => true).catch(() => false);
  if (!exists) {
    throw new Error("knowledge-base.json no encontrado.");
  }

  const stat = await fs.stat(BASE_FILE);
  const sizeMb = stat.size / (1024 * 1024);
  if (sizeMb > MAX_SYNC_MB) {
    throw new Error(`knowledge-base.json excede limite de sync (${MAX_SYNC_MB}MB). Ejecuta limpieza/compresion.`);
  }

  await runGit(["add", "."]);
  await runGit(["commit", "-m", "chore: sync optimized knowledge base", "--allow-empty"]);

  if (process.argv.includes("--push")) {
    await runGit(["push"]);
  }

  console.log(JSON.stringify({ synced: true, file: BASE_FILE, sizeMb: Math.round(sizeMb * 100) / 100 }));
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
