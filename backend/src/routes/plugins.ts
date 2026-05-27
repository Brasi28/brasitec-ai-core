import { Router } from "express";
import { z } from "zod";
import { executePlugin, listPlugins } from "../services/pluginService";
import { getRecentLogs } from "../services/loggerService";

export const pluginsRouter = Router();

const execSchema = z.object({
  pluginId: z.string().min(1),
  payload: z.record(z.unknown()).optional()
});

pluginsRouter.get("/", (_req, res) => {
  res.json({ plugins: listPlugins() });
});

pluginsRouter.post("/execute", async (req, res) => {
  try {
    const data = execSchema.parse(req.body);
    const result = await executePlugin(data.pluginId, data.payload ?? {});
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Error ejecutando plugin" });
  }
});

pluginsRouter.get("/logs", async (req, res) => {
  const limit = Number(req.query.limit || 100);
  const lines = await getRecentLogs(limit);
  res.json({ lines });
});
