param(
  [string]$KnowledgeRoot = "H:\aprendizado ia"
)

$ErrorActionPreference = "Stop"

$projectRoot = Join-Path $PSScriptRoot ".."
$env:KNOWLEDGE_ROOT = $KnowledgeRoot
$env:NODE_NO_WARNINGS = "1"
$env:GPU_REQUIRED = "true"
$env:OLLAMA_MODEL = "nomic-embed-text"

Set-Location $projectRoot
npm run learn:daemon
