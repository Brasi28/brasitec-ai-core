param(
  [string]$KnowledgeRoot = "H:\aprendizado ia"
)

$ErrorActionPreference = "Stop"

$projectRoot = Join-Path $PSScriptRoot ".."
$env:KNOWLEDGE_ROOT = $KnowledgeRoot
$env:NODE_NO_WARNINGS = "1"

Set-Location $projectRoot
npm run learn:daemon
