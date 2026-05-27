param(
  [string]$ProjectRoot = "E:\agentes\brasitec-ai-core",
  [string]$KnowledgeRoot = "H:\aprendizado ia"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command schtasks.exe -ErrorAction SilentlyContinue)) {
  throw "schtasks.exe no esta disponible en este entorno."
}

$runner = Join-Path $ProjectRoot "tools\run-evolution-cycle.ps1"
$startTurbo = (Get-Date).AddMinutes(2)
$startStable = (Get-Date).AddDays(5).AddMinutes(5)

$t1 = $startTurbo.ToString("HH:mm")
$d1 = $startTurbo.ToString("MM/dd/yyyy")
$t2 = $startStable.ToString("HH:mm")
$d2 = $startStable.ToString("MM/dd/yyyy")

$taskCommand = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$runner`""

try { schtasks.exe /Delete /TN "BrasitecAICore-Turbo" /F | Out-Null } catch { }
try { schtasks.exe /Delete /TN "BrasitecAICore-Stable" /F | Out-Null } catch { }

$turboResult = & schtasks.exe /Create /SC MINUTE /MO 60 /DU 120:00 /TN "BrasitecAICore-Turbo" /TR $taskCommand /ST $t1 /SD $d1 /RL HIGHEST /F
$stableResult = & schtasks.exe /Create /SC HOURLY /MO 8 /TN "BrasitecAICore-Stable" /TR $taskCommand /ST $t2 /SD $d2 /RL HIGHEST /F

if ($LASTEXITCODE -ne 0) {
  throw "No se pudieron registrar tareas en Task Scheduler."
}

Write-Host $turboResult
Write-Host $stableResult
Write-Host "Tareas registradas: BrasitecAICore-Turbo y BrasitecAICore-Stable"
Write-Host "Turbo inicia: $startTurbo"
Write-Host "Stable inicia: $startStable"
