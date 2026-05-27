import { Router } from "express";
import { z } from "zod";
import { readFileSafe, writeFileSafe } from "../services/fileService";

export const filesRouter = Router();

const readSchema = z.object({ path: z.string().min(1) });
const writeSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
  createDirs: z.boolean().optional()
});

filesRouter.post("/read", async (req, res) => {
  try {
    const data = readSchema.parse(req.body);
    const result = await readFileSafe(data.path);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Error leyendo archivo" });
  }
});

filesRouter.post("/write", async (req, res) => {
  try {
    const data = writeSchema.parse(req.body);
    const result = await writeFileSafe(data.path, data.content, data.createDirs);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Error escribiendo archivo" });
  }
});
