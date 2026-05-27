export type AgentId = "code-agent" | "workspace-agent" | "artifacts-agent" | "autonomous-agent";

export type OpenFilePayload = {
  path: string;
  content?: string;
};

export class BrasitecAiClient {
  constructor(private readonly baseUrl = process.env.BRASI_BACKEND_URL || "http://localhost:4000") {}

  private async post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "Request failed");
    }
    return data as T;
  }

  readFile(path: string) {
    return this.post<{ path: string; content: string }>("/api/files/read", { path });
  }

  writeFile(path: string, content: string) {
    return this.post<{ path: string; bytes: number }>("/api/files/write", { path, content, createDirs: true });
  }

  executeCommand(command: string, cwd?: string) {
    return this.post<{ stdout: string; stderr: string }>("/api/commands/execute", { command, cwd });
  }

  analyzeProject(rootPath: string) {
    return this.post<{ rootPath: string; fileTypes: Record<string, number>; signals: string[] }>(
      "/api/projects/analyze",
      { rootPath }
    );
  }

  runAgent(agentId: AgentId, projectPath: string, goal: string, context?: string) {
    return this.post<{ agentId: AgentId; prompt: string; executionPlan: string[]; examplesUsed: number }>("/api/agents/run", {
      agentId,
      projectPath,
      goal,
      context
    });
  }

  runAgentWithExamples(input: {
    agentId: AgentId;
    projectPath: string;
    goal: string;
    context?: string;
    githubQuery: string;
    githubLanguage?: string;
    githubLimit?: number;
  }) {
    return this.post<{ agentId: AgentId; prompt: string; executionPlan: string[]; examplesUsed: number }>(
      "/api/agents/run",
      input
    );
  }

  searchPublicRepos(topic: string, language?: string, limit?: number) {
    return this.post<{ repos: Array<{ fullName: string; stars: number; description: string | null; url: string }> }>(
      "/api/github/repos/search",
      { topic, language, limit }
    );
  }

  getCodeExamples(query: string, language?: string, maxExamples?: number) {
    return this.post<{
      examples: Array<{
        repository: { fullName: string; url: string };
        path: string;
        snippet: string;
      }>;
      summary: string;
    }>("/api/github/examples", { query, language, maxExamples });
  }

  listPlugins() {
    return fetch(`${this.baseUrl}/api/plugins`).then((response) => response.json() as Promise<{ plugins: unknown[] }>);
  }

  executePlugin(pluginId: string, payload: Record<string, unknown> = {}) {
    return this.post<{ pluginId: string; result: unknown }>("/api/plugins/execute", { pluginId, payload });
  }

  getRecentLogs(limit = 100) {
    return fetch(`${this.baseUrl}/api/plugins/logs?limit=${limit}`).then(
      (response) => response.json() as Promise<{ lines: string[] }>
    );
  }

  syncWorkspace(workspaceRoot: string, openFiles: string[], activeFile?: string) {
    return this.post<{ syncedAt: string; openFiles: number; activeFile?: string }>("/api/workspace/sync", {
      workspaceRoot,
      openFiles,
      activeFile
    });
  }

  sendOpenFiles(files: OpenFilePayload[]) {
    return this.post<{ saved: number }>("/api/workspace/open-files", { files });
  }
}
