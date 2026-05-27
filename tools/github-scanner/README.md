# github-scanner

Modulo para consultar repositorios publicos de GitHub y producir ejemplos para agentes.

## Funciones

- `searchPublicReposByTopic(topic, language, limit)`
- `downloadRelevantFiles(query, language, limit)`
- `analyzeCodePatterns(files, patterns)`
- `generateSummary(files, topPatterns)`
- `buildExamplesForAgent(files)`

## Uso rapido

```ts
import {
  searchPublicReposByTopic,
  downloadRelevantFiles,
  analyzeCodePatterns,
  generateSummary,
  buildExamplesForAgent
} from "@brasitec-ai-core/github-scanner";

async function run() {
  const repos = await searchPublicReposByTopic("typescript", "TypeScript", 5);
  const files = await downloadRelevantFiles("express middleware", "TypeScript", 3);
  const patterns = analyzeCodePatterns(files, ["Router", "async", "zod"]);
  const summary = generateSummary(files, patterns);
  const examples = buildExamplesForAgent(files);

  console.log(repos, summary, examples.length);
}

void run();
```

## Notas

- Para evitar rate limits, configura `GITHUB_TOKEN` en el entorno.
- Este modulo consulta solo repositorios publicos.
