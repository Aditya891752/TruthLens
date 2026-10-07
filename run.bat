@echo off
title TruthLens Launcher
echo ========================================================
echo   Starting TruthLens Platform (Backend + Frontend)
echo ========================================================

echo [1/2] Launching FastAPI Backend on port 8000...
start "TruthLens Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Launching Vite Frontend on port 5173...
start "TruthLens Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   TruthLens is running!
echo   - Web App UI:     http://localhost:5173
echo   - Backend API:    http://127.0.0.1:8000
echo   - Swagger Docs:   http://127.0.0.1:8000/docs
echo ========================================================
echo.
timeout /t 5
