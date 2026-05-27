param(
  [string]$ProjectRoot = "E:\agentes\brasitec-ai-core",
  [string]$KnowledgeRoot = "H:\aprendizado ia"
)

$ErrorActionPreference = "Stop"

$startupDir = [Environment]::GetFolderPath("Startup")
if (-not (Test-Path $startupDir)) {
  throw "No se encontro la carpeta Startup del usuario."
}

$runner = Join-Path $ProjectRoot "tools\daemon-runner.ps1"
if (-not (Test-Path $runner)) {
  throw "No se encontro el runner: $runner"
}

$launcherPath = Join-Path $startupDir "BrasitecAICoreDaemon.cmd"
$cmdContent = @"
@echo off
set "KNOWLEDGE_ROOT=$KnowledgeRoot"
cd /d "$ProjectRoot"
start "Brasitec AI Core Daemon" /min powershell -NoProfile -ExecutionPolicy Bypass -File "$runner" -KnowledgeRoot "$KnowledgeRoot"
exit /b 0
"@

Set-Content -Path $launcherPath -Value $cmdContent -Encoding ASCII
Write-Host "Autostart instalado: $launcherPath"
