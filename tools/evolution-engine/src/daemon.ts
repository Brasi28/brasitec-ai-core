import { spawn } from "node:child_process";
import path from "node:path";

const root = path.resolve(process.cwd(), "..", "..");
const highLoadMode = (process.env.HIGH_LOAD_MODE || "false").toLowerCase() === "true";
const defaultPollMs = highLoadMode ? 5 * 60 * 1000 : 30 * 60 * 1000;
const pollMs = Number(process.env.EVOLUTION_POLL_MS || defaultPollMs);

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
