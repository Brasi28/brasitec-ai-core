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

$turboCmd = "powershell -NoProfile -ExecutionPolicy Bypass -File `"$runner`" -KnowledgeRoot `"$KnowledgeRoot`""

try { schtasks.exe /Delete /TN "BrasitecAICore-Turbo" /F | Out-Null } catch { }
try { schtasks.exe /Delete /TN "BrasitecAICore-Stable" /F | Out-Null } catch { }

schtasks.exe /Create /SC HOURLY /MO 1 /DUR 120:00 /TN "BrasitecAICore-Turbo" /TR $turboCmd /ST $t1 /SD $d1 /RL HIGHEST /F | Out-Null
schtasks.exe /Create /SC HOURLY /MO 8 /TN "BrasitecAICore-Stable" /TR $turboCmd /ST $t2 /SD $d2 /RL HIGHEST /F | Out-Null

Write-Host "Tareas registradas: BrasitecAICore-Turbo y BrasitecAICore-Stable"
Write-Host "Turbo inicia: $startTurbo"
Write-Host "Stable inicia: $startStable"
