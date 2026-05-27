import { Router } from "express";
import { z } from "zod";
import { runAgent } from "../services/agentService";

export const agentsRouter = Router();

const runSchema = z.object({
  agentId: z.enum(["code-agent", "workspace-agent", "artifacts-agent", "autonomous-agent"]),
  projectPath: z.string().min(1),
  goal: z.string().min(1),
  context: z.string().optional(),
  githubQuery: z.string().min(1).optional(),
  githubLanguage: z.string().min(1).optional(),
  githubLimit: z.number().int().positive().max(10).optional()
});

agentsRouter.post("/run", async (req, res) => {
  try {
    const data = runSchema.parse(req.body);
    const result = await runAgent(data);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Error ejecutando agente" });
  }
});
