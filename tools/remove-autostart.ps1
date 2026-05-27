$startupDir = [Environment]::GetFolderPath("Startup")
$launcherPath = Join-Path $startupDir "BrasitecAICoreDaemon.cmd"

if (Test-Path $launcherPath) {
  Remove-Item $launcherPath -Force
  Write-Host "Autostart eliminado: $launcherPath"
} else {
  Write-Host "No existe autostart para eliminar."
}
