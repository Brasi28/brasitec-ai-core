import fs from "node:fs/promises";
import { BrasitecAiClient, type OpenFilePayload } from "./index";

export type VsCodeSyncPayload = {
  workspaceRoot: string;
  openFiles: string[];
  activeFile?: string;
};

export async function syncVsCodeWorkspace(client: BrasitecAiClient, payload: VsCodeSyncPayload) {
  return client.syncWorkspace(payload.workspaceRoot, payload.openFiles, payload.activeFile);
}

export async function sendVsCodeOpenFiles(client: BrasitecAiClient, files: string[]) {
  const payload: OpenFilePayload[] = await Promise.all(
    files.map(async (filePath) => {
      const content = await fs.readFile(filePath, "utf8");
      return { path: filePath, content };
    })
  );

  return client.sendOpenFiles(payload);
}
