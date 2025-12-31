# MyFuture Azure Deployment Script
# Kör detta skript för att bygga och förbereda för deployment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MyFuture Azure Deployment Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Bygg frontend
Write-Host "`n[1/4] Bygger frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
npm run build
Set-Location ..

# 2. Kopiera frontend build till backend wwwroot
Write-Host "`n[2/4] Kopierar frontend till backend..." -ForegroundColor Yellow
$wwwrootPath = "backend\MyFuture.Api\wwwroot"
if (Test-Path $wwwrootPath) {
    Remove-Item -Recurse -Force $wwwrootPath
}
Copy-Item -Recurse "frontend\dist" $wwwrootPath

# 3. Bygg backend
Write-Host "`n[3/4] Bygger backend..." -ForegroundColor Yellow
Set-Location backend\MyFuture.Api
dotnet publish -c Release -o ../../publish
Set-Location ../..

# 4. Klart!
Write-Host "`n[4/4] Klart!" -ForegroundColor Green
Write-Host "`nPublish-mappen finns i: publish\" -ForegroundColor Cyan
Write-Host "Ladda upp innehållet i 'publish' till Azure App Service" -ForegroundColor Cyan
Write-Host "`nAlternativt, använd Azure CLI:" -ForegroundColor Yellow
Write-Host "  az webapp deploy --resource-group <resursgrupp> --name <app-namn> --src-path publish.zip" -ForegroundColor White

