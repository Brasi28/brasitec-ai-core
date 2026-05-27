import { Router } from "express";
import { z } from "zod";
import { analyzeProject } from "../services/analysisService";

export const projectsRouter = Router();

const schema = z.object({ rootPath: z.string().min(1) });

projectsRouter.post("/analyze", async (req, res) => {
  try {
    const data = schema.parse(req.body);
    const result = await analyzeProject(data.rootPath);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Error analizando proyecto" });
  }
});
