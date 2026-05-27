import { Router } from "express";
import { z } from "zod";
import { getCodeExamples, searchPublicRepos, summarizeExamples } from "../services/githubService";

export const githubRouter = Router();

const searchSchema = z.object({
  topic: z.string().min(1),
  language: z.string().optional(),
  limit: z.number().int().positive().max(50).optional()
});

const examplesSchema = z.object({
  query: z.string().min(1),
  language: z.string().optional(),
  maxExamples: z.number().int().positive().max(10).optional()
});

githubRouter.post("/repos/search", async (req, res) => {
  try {
    const data = searchSchema.parse(req.body);
    const repos = await searchPublicRepos(data);
    res.json({ repos });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Error consultando GitHub" });
  }
});

githubRouter.post("/examples", async (req, res) => {
  try {
    const data = examplesSchema.parse(req.body);
    const examples = await getCodeExamples(data);
    res.json({ examples, summary: summarizeExamples(examples) });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Error consultando ejemplos" });
  }
});
