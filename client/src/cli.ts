#!/usr/bin/env node
import "dotenv/config";
import { Command } from "commander";
import { BrasitecAiClient } from "./index";
import { sendVsCodeOpenFiles, syncVsCodeWorkspace } from "./vscodeSync";

const cli = new Command();
const client = new BrasitecAiClient();

cli.name("brasitec-ai").description("CLI para consumir brasitec-ai-core").version("0.1.0");

cli
  .command("analyze")
  .argument("<rootPath>", "Ruta del proyecto")
  .action(async (rootPath) => {
    const result = await client.analyzeProject(rootPath);
    console.log(JSON.stringify(result, null, 2));
  });

cli
  .command("read")
  .argument("<path>", "Ruta del archivo")
  .action(async (filePath) => {
    const result = await client.readFile(filePath);
    console.log(result.content);
  });

cli
  .command("write")
  .argument("<path>", "Ruta del archivo")
  .argument("<content>", "Contenido")
  .action(async (filePath, content) => {
    const result = await client.writeFile(filePath, content);
    console.log(JSON.stringify(result, null, 2));
  });

cli
  .command("exec")
  .argument("<command>", "Comando a ejecutar")
  .option("--cwd <cwd>", "Directorio de trabajo")
  .action(async (command, options) => {
    const result = await client.executeCommand(command, options.cwd);
    console.log(result.stdout || result.stderr);
  });

cli
  .command("run-agent")
  .argument("<agentId>", "code-agent | workspace-agent | artifacts-agent | autonomous-agent")
  .argument("<projectPath>", "Ruta del proyecto")
  .argument("<goal>", "Objetivo del agente")
  .option("--context <context>", "Contexto adicional")
  .option("--github-query <githubQuery>", "Query para buscar ejemplos en repos publicos")
  .option("--github-language <githubLanguage>", "Lenguaje para filtrar ejemplos")
  .option("--github-limit <githubLimit>", "Maximo de ejemplos", Number)
  .action(async (agentId, projectPath, goal, options) => {
    const result = options.githubQuery
      ? await client.runAgentWithExamples({
          agentId,
          projectPath,
          goal,
          context: options.context,
          githubQuery: options.githubQuery,
          githubLanguage: options.githubLanguage,
          githubLimit: options.githubLimit
        })
      : await client.runAgent(agentId, projectPath, goal, options.context);
    console.log(JSON.stringify(result, null, 2));
  });

cli
  .command("github-search")
  .argument("<topic>", "Topic de GitHub")
  .option("--language <language>", "Lenguaje")
  .option("--limit <limit>", "Cantidad maxima", Number)
  .action(async (topic, options) => {
    const result = await client.searchPublicRepos(topic, options.language, options.limit);
    console.log(JSON.stringify(result, null, 2));
  });

cli
  .command("github-examples")
  .argument("<query>", "Consulta de codigo")
  .option("--language <language>", "Lenguaje")
  .option("--max <max>", "Maximo de ejemplos", Number)
  .action(async (query, options) => {
    const result = await client.getCodeExamples(query, options.language, options.max);
    console.log(JSON.stringify(result, null, 2));
  });

cli
  .command("vscode-sync")
  .requiredOption("--workspace <workspace>", "Root del workspace")
  .requiredOption("--open-files <openFiles>", "Archivos abiertos separados por coma")
  .option("--active-file <activeFile>", "Archivo activo")
  .action(async (options) => {
    const openFiles = String(options.openFiles)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const result = await syncVsCodeWorkspace(client, {
      workspaceRoot: options.workspace,
      openFiles,
      activeFile: options.activeFile
    });

    console.log(JSON.stringify(result, null, 2));
  });

cli
  .command("vscode-open-files")
  .requiredOption("--files <files>", "Archivos separados por coma")
  .action(async (options) => {
    const files = String(options.files)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const result = await sendVsCodeOpenFiles(client, files);
    console.log(JSON.stringify(result, null, 2));
  });

cli.parseAsync(process.argv).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
