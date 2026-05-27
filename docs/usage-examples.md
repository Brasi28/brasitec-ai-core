# Ejemplos de Integracion en Otros Proyectos

## Uso del SDK

```ts
import { BrasitecAiClient } from "@brasitec-ai-core/client";

const client = new BrasitecAiClient("http://localhost:4000");

const analysis = await client.analyzeProject(".");
console.log(analysis.signals);
```

## Ejecutar agente con ejemplos open-source

```ts
const result = await client.runAgentWithExamples({
  agentId: "code-agent",
  projectPath: ".",
  goal: "Crear middleware de auditoria",
  githubQuery: "express audit middleware",
  githubLanguage: "TypeScript",
  githubLimit: 3
});

console.log(result.examplesUsed);
```

## Sincronizar archivos abiertos de VS Code

```ts
import { sendVsCodeOpenFiles, syncVsCodeWorkspace } from "@brasitec-ai-core/client/dist/vscodeSync";

await syncVsCodeWorkspace(client, {
  workspaceRoot: ".",
  openFiles: ["src/index.ts"],
  activeFile: "src/index.ts"
});

await sendVsCodeOpenFiles(client, ["src/index.ts"]);
```
