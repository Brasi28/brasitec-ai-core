import { Router } from "express";
import { z } from "zod";
import { saveOpenFilesSnapshot, syncWorkspaceState } from "../services/workspaceSyncService";

export const workspaceRouter = Router();

const syncSchema = z.object({
  workspaceRoot: z.string().min(1),
  openFiles: z.array(z.string()),
  activeFile: z.string().optional()
});

const openFilesSchema = z.object({
  files: z.array(
    z.object({
      path: z.string().min(1),
      content: z.string().optional()
    })
  )
});

workspaceRouter.post("/sync", async (req, res) => {
  try {
    const data = syncSchema.parse(req.body);
    const result = await syncWorkspaceState(data);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Error sincronizando workspace" });
  }
});

workspaceRouter.post("/open-files", async (req, res) => {
  try {
    const data = openFilesSchema.parse(req.body);
    const result = await saveOpenFilesSnapshot(data);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Error procesando archivos abiertos" });
  }
});
