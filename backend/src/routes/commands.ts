import { Router } from "express";
import { z } from "zod";
import { executeCommandSafe } from "../services/commandService";

export const commandsRouter = Router();

const execSchema = z.object({
  command: z.string().min(1),
  cwd: z.string().optional(),
  timeoutMs: z.number().int().positive().max(120000).optional()
});

commandsRouter.post("/execute", async (req, res) => {
  try {
    const data = execSchema.parse(req.body);
    const result = await executeCommandSafe(data);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Error ejecutando comando" });
  }
});
