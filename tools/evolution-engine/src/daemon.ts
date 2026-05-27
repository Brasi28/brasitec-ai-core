import { spawn } from "node:child_process";
import path from "node:path";

const root = path.resolve(process.cwd(), "..", "..");
const pollMs = Number(process.env.EVOLUTION_POLL_MS || 30 * 60 * 1000);

function runCycle(): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["--workspace", "tools/evolution-engine", "run", "run"], {
      cwd: root,
      stdio: "inherit",
      windowsHide: true,
      shell: true
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`evolution cycle failed with code ${code}`));
      }
    });
  });
}

async function loop(): Promise<void> {
  while (true) {
    try {
      await runCycle();
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
    }

    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
}

void loop();
