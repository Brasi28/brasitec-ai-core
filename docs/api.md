# API Backend

Base URL: `http://localhost:4000`

## Salud

- `GET /api/health`

## Archivos

- `POST /api/files/read`
  - body: `{ "path": "relative/or/absolute" }`
- `POST /api/files/write`
  - body: `{ "path": "...", "content": "...", "createDirs": true }`

## Comandos

- `POST /api/commands/execute`
  - body: `{ "command": "npm test", "cwd": ".", "timeoutMs": 20000 }`

## Analisis de proyectos

- `POST /api/projects/analyze`
  - body: `{ "rootPath": "." }`

## Ejecucion de agentes

- `POST /api/agents/run`
  - body: `{ "agentId": "code-agent", "projectPath": ".", "goal": "...", "context": "...", "githubQuery": "express middleware", "githubLanguage": "TypeScript", "githubLimit": 3 }`

## GitHub publico

- `POST /api/github/repos/search`
  - body: `{ "topic": "typescript", "language": "TypeScript", "limit": 10 }`
- `POST /api/github/examples`
  - body: `{ "query": "express error middleware", "language": "TypeScript", "maxExamples": 3 }`

## Plugins

- `GET /api/plugins`
- `POST /api/plugins/execute`
  - body: `{ "pluginId": "echo", "payload": { "hello": "world" } }`
- `GET /api/plugins/logs?limit=100`

## Sync con VS Code

- `POST /api/workspace/sync`
  - body: `{ "workspaceRoot": ".", "openFiles": ["src/index.ts"], "activeFile": "src/index.ts" }`
- `POST /api/workspace/open-files`
  - body: `{ "files": [{ "path": "src/index.ts", "content": "..." }] }`
