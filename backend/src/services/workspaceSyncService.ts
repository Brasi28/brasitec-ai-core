import fs from "node:fs/promises";
import { resolveWorkspacePath } from "../utils/paths";

type OpenFilePayload = {
  path: string;
  content?: string;
};

export async function syncWorkspaceState(input: {
  workspaceRoot: string;
  openFiles: string[];
  activeFile?: string;
}): Promise<{ syncedAt: string; openFiles: number; activeFile?: string }> {
  const workspaceRoot = resolveWorkspacePath(input.workspaceRoot);
  return {
    syncedAt: new Date().toISOString(),
    openFiles: input.openFiles.length,
    activeFile: input.activeFile ? resolveWorkspacePath(input.activeFile) : undefined
  };
}

export async function saveOpenFilesSnapshot(input: {
  files: OpenFilePayload[];
}): Promise<{ saved: number }> {
  let saved = 0;

  for (const file of input.files) {
    const target = resolveWorkspacePath(file.path);
    const content = file.content ?? (await fs.readFile(target, "utf8"));
    const snapshotPath = `${target}.open.snapshot`;
    await fs.writeFile(snapshotPath, content, "utf8");
    saved += 1;
  }

  return { saved };
}
