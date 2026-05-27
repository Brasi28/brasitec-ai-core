param(
  [string]$KnowledgeRoot = "H:\aprendizado ia"
)

$ErrorActionPreference = "Stop"

$env:KNOWLEDGE_ROOT = $KnowledgeRoot
$env:NODE_NO_WARNINGS = "1"

Set-Location (Join-Path $PSScriptRoot "..")
npm run learn:cycle
