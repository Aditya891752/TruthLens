Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Starting TruthLens Platform (Backend + Frontend)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "`n[1/2] Launching FastAPI Backend on port 8000..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "[2/2] Launching Vite Frontend on port 5173..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm run dev"

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "   TruthLens is running!" -ForegroundColor Green
Write-Host "   - Web App UI:     http://localhost:5173" -ForegroundColor Yellow
Write-Host "   - Backend API:    http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "   - Swagger Docs:   http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "========================================================`n" -ForegroundColor Green
