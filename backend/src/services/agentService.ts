import fs from "node:fs/promises";
import path from "node:path";
import { getWorkspaceRoot, resolveWorkspacePath } from "../utils/paths";
import { getCodeExamples } from "./githubService";

type KnowledgePattern = {
  language: string;
  snippet: string;
  score: number;
  confidence: number;
};

export type AgentId = "code-agent" | "workspace-agent" | "artifacts-agent" | "autonomous-agent";

export async function runAgent(input: {
  agentId: AgentId;
  projectPath: string;
  goal: string;
  context?: string;
  githubQuery?: string;
  githubLanguage?: string;
  githubLimit?: number;
}): Promise<{
  agentId: AgentId;
  prompt: string;
  executionPlan: string[];
  examplesUsed: number;
}> {
  const projectPath = resolveWorkspacePath(input.projectPath);
  const agentDir = path.join(getWorkspaceRoot(), "agents", input.agentId);

  const [masterPrompt, configRaw] = await Promise.all([
    fs.readFile(path.join(agentDir, "master-prompt.md"), "utf8"),
    fs.readFile(path.join(agentDir, "config.json"), "utf8")
  ]);

  const config = JSON.parse(configRaw) as { capabilities: string[] };
  const learnedPatterns = await loadKnowledgePatterns(3);
  const examples = input.githubQuery
    ? await getCodeExamples({
        query: input.githubQuery,
        language: input.githubLanguage,
        maxExamples: input.githubLimit
      })
    : [];

  const knowledgeBlock = learnedPatterns.length
    ? [
        "",
        "LEARNED_PATTERNS:",
        ...learnedPatterns.map(
          (pattern, index) =>
            `${index + 1}. [${pattern.language}] score=${pattern.score} confidence=${pattern.confidence}\n${pattern.snippet}`
        )
      ].join("\n")
    : "";

  const examplesBlock = examples.length
    ? [
        "",
        "OPEN_SOURCE_EXAMPLES:",
        ...examples.map(
          (example, index) =>
            `${index + 1}. ${example.repository.fullName} - ${example.path}\n${example.snippet}`
        )
      ].join("\n")
    : "";

  const prompt = [
    masterPrompt,
    "",
    `GOAL: ${input.goal}`,
    `PROJECT_PATH: ${projectPath}`,
    input.context ? `CONTEXT: ${input.context}` : "",
    knowledgeBlock,
    examplesBlock
  ]
    .filter(Boolean)
    .join("\n");

  const executionPlan = [
    `Validar objetivo con ${input.agentId}`,
    `Inspeccionar proyecto en ${projectPath}`,
    ...config.capabilities.map((c) => `Aplicar capacidad: ${c}`),
    "Generar salida estructurada"
  ];

  return { agentId: input.agentId, prompt, executionPlan, examplesUsed: examples.length };
}

async function loadKnowledgePatterns(limit: number): Promise<KnowledgePattern[]> {
  try {
    const knowledgeRoot = path.resolve(process.env.KNOWLEDGE_ROOT || "H:\\aprendizado ia");
    const file = path.join(knowledgeRoot, "knowledge-base.json");
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as { patterns?: KnowledgePattern[] };
    return (parsed.patterns || []).slice(0, limit);
  } catch {
    return [];
  }
}
