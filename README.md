# brasitec-ai-core

Motor central de IA para orquestar agentes reutilizables en cualquier proyecto.

## Vision

`brasitec-ai-core` consolida un stack modular para automatizar tareas de desarrollo con agentes especializados. Incluye API backend, SDK/CLI de cliente, modulo de exploracion open-source y documentacion para reutilizarlo en otros repositorios.

## Estructura

- `agents/`
	- `code-agent/`
	- `workspace-agent/`
	- `artifacts-agent/`
	- `autonomous-agent/`
- `backend/`
- `client/`
- `prompts/`
- `tools/`
	- `github-scanner/`
	- `local-learning-engine/`
	- `knowledge-cleaner/`
	- `knowledge-compressor/`
	- `knowledge-rotator/`
	- `long-term-memory/`
	- `evolution-engine/`
	- `github-sync/`
- `docs/`

## Requisitos

- Node.js 20+
- npm 10+

## Inicio Rapido

```bash
npm install
npm run build
npm run dev
```

Backend por defecto: `http://localhost:4000`

## Funcionalidades Clave

- Agentes con prompt maestro, reglas, funciones, config, docs internas y ejemplos.
- Backend con endpoints para archivos, comandos, analisis, GitHub publico, plugins y sync VS Code.
- Sistema de logs estructurados con consulta de registros recientes.
- Sistema de plugins extensible para agregar nuevas capacidades.
- Cliente SDK + CLI para uso desde cualquier proyecto.
- Modulo `tools/github-scanner` para buscar repos, descargar snippets, analizar patrones y generar resumenes.
- Sistema de evolucion continua de 3 fases con almacenamiento local persistente en `H:\aprendizado ia`.

## Scripts Utiles

- `npm run dev`: levanta paquetes en modo desarrollo.
- `npm run build`: compila backend, client y todo el ecosistema de tools.
- `npm run start`: inicia backend compilado.
- `npm run client:cli -- --help`: muestra comandos de la CLI.
- `npm run scanner:build`: compila modulo github-scanner.
- `npm run learn:cycle`: ejecuta un ciclo de evolucion por fase.
- `npm run learn:daemon`: ejecuta evolucion continua en modo daemon.
- `npm run learn:turbo`: ejecuta aprendizaje turbo manual.
- `npm run knowledge:clean`: limpia base bruta.
- `npm run knowledge:compress`: comprime base.
- `npm run knowledge:rotate`: rota patrones antiguos.
- `npm run memory:update`: actualiza memoria de largo plazo.
- `npm run github:sync`: sincroniza conocimiento optimizado.

## Uso Basico del Cliente

```ts
import { BrasitecAiClient } from "@brasitec-ai-core/client";

const client = new BrasitecAiClient("http://localhost:4000");

const report = await client.analyzeProject(".");
console.log(report.signals);
```

## Integracion con Ejemplos Open-Source

```ts
const result = await client.runAgentWithExamples({
	agentId: "code-agent",
	projectPath: ".",
	goal: "Agregar endpoint robusto",
	githubQuery: "express zod endpoint",
	githubLanguage: "TypeScript",
	githubLimit: 3
});

console.log(result.examplesUsed);
```

## Documentacion

- API: `docs/api.md`
- Arquitectura: `docs/architecture.md`
- Backend: `docs/backend.md`
- Cliente: `docs/client.md`
- Agentes: `docs/agents/*.md`
- GitHub: `docs/github.md`
- Integracion en otros proyectos: `docs/usage-examples.md`
- Evolucion continua: `docs/continuous-evolution.md`
- Mantenimiento anual: `docs/maintenance-years.md`

## Automatizacion De Evolucion

Configura evolucion continua con daemon o tareas programadas:

```powershell
powershell -ExecutionPolicy Bypass -File tools/setup-evolution-tasks.ps1 -ProjectRoot "E:\agentes\brasitec-ai-core" -KnowledgeRoot "H:\aprendizado ia"
```

Arranque automatico al iniciar sesion (recomendado):

```powershell
powershell -ExecutionPolicy Bypass -File tools/install-autostart.ps1 -ProjectRoot "E:\agentes\brasitec-ai-core" -KnowledgeRoot "H:\aprendizado ia"
```

Desinstalar arranque automatico:

```powershell
powershell -ExecutionPolicy Bypass -File tools/remove-autostart.ps1
```

## Modo GPU Estricto

El aprendizaje puede ejecutarse en modo GPU estricto (por defecto):

- `GPU_REQUIRED=true`
- Si no hay GPU activa en `nvidia-smi` o `ollama ps`, el ciclo falla.
- El scoring de patrones se realiza con embeddings en Ollama (`OLLAMA_MODEL`).

## Aprendizaje 24/7

Configuracion recomendada para aprendizaje continuo:

- `ALWAYS_ON_LEARNING=true`
- `HIGH_LOAD_MODE=true`
- `EVOLUTION_POLL_MS=300000` (5 minutos)

Con esta configuracion el daemon ejecuta ciclos de forma ininterrumpida 24/7.

## Publicacion en GitHub

```bash
git init
git add .
git commit -m "feat: initial brasitec-ai-core engine"
git branch -M main
git remote add origin <URL_DEL_REPO>
git push -u origin main
```

Licencia: MIT (ver `LICENSE`).
