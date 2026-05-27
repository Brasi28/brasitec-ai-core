import fs from "node:fs/promises";
import path from "node:path";
import { resolveWorkspacePath } from "../utils/paths";

const maxFileBytes = Number(process.env.MAX_FILE_BYTES || 1024 * 1024);

export async function readFileSafe(rawPath: string): Promise<{ path: string; content: string }> {
  const target = resolveWorkspacePath(rawPath);
  const stat = await fs.stat(target);
  if (stat.size > maxFileBytes) {
    throw new Error(`Archivo supera limite permitido (${maxFileBytes} bytes)`);
  }

  const content = await fs.readFile(target, "utf8");
  return { path: target, content };
}

export async function writeFileSafe(
  rawPath: string,
  content: string,
  createDirs = true
): Promise<{ path: string; bytes: number }> {
  const target = resolveWorkspacePath(rawPath);
  if (createDirs) {
    await fs.mkdir(path.dirname(target), { recursive: true });
  }
  await fs.writeFile(target, content, "utf8");
  return { path: target, bytes: Buffer.byteLength(content, "utf8") };
}
