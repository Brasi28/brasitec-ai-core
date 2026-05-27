import { exec } from "node:child_process";
import { promisify } from "node:util";
import { resolveWorkspacePath } from "../utils/paths";

const execAsync = promisify(exec);

export async function executeCommandSafe(input: {
  command: string;
  cwd?: string;
  timeoutMs?: number;
}): Promise<{ stdout: string; stderr: string }> {
  const timeoutMs = input.timeoutMs ?? Number(process.env.COMMAND_TIMEOUT_MS || 20000);
  const cwd = input.cwd ? resolveWorkspacePath(input.cwd) : resolveWorkspacePath(".");

  const { stdout, stderr } = await execAsync(input.command, {
    cwd,
    timeout: timeoutMs,
    windowsHide: true,
    maxBuffer: 1024 * 1024
  });

  return { stdout, stderr };
}
