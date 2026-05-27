param(
  [string]$KnowledgeRoot = "H:\aprendizado ia"
)

$ErrorActionPreference = "Stop"

$projectRoot = Join-Path $PSScriptRoot ".."
$env:KNOWLEDGE_ROOT = $KnowledgeRoot
$env:NODE_NO_WARNINGS = "1"
$env:GPU_REQUIRED = "true"
$env:OLLAMA_MODEL = "nomic-embed-text"
$env:HIGH_LOAD_MODE = "true"
$env:ALWAYS_ON_LEARNING = "true"
$env:EVOLUTION_POLL_MS = "300000"
$env:LEARN_TURBO_MAX_REPOS = "8"
$env:LEARN_TURBO_MAX_FILES = "220"
$env:LEARN_STABLE_MAX_REPOS = "5"
$env:LEARN_STABLE_MAX_FILES = "160"
$env:PAUSE_MIN_MS = "80"
$env:PAUSE_MAX_MS = "300"

Set-Location $projectRoot
npm run learn:daemon
