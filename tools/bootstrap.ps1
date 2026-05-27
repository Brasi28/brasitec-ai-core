Write-Host "Instalando dependencias del monorepo..."
npm install

Write-Host "Compilando proyecto..."
npm run build

Write-Host "Verificando modulo github-scanner..."
npm run scanner:build

Write-Host "Listo."
