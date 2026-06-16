# Maximize AI Life OS Launcher Script
# This script launches the FastAPI backend, the React frontend, and local n8n concurrently.

Write-Host "==================================================" -ForegroundColor Magenta
Write-Host "         BOOTING MAXIMIZE LIFE OS PANELS          " -ForegroundColor Magenta
Write-Host "==================================================" -ForegroundColor Magenta

# 1. Start FastAPI Backend in a new terminal window
Write-Host "[+] Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Cyan
Start-Process powershell -WorkingDirectory "c:\projects\Maximize\backend" -ArgumentList "-NoExit", "-Command", "
  Write-Host '--- FastAPI Productivity Backend ---' -ForegroundColor Cyan;
  if (Test-Path .\venv\Scripts\activate) {
    .\venv\Scripts\activate;
  } else {
    Write-Host 'WARNING: Virtual environment not found. Running with system python...' -ForegroundColor Yellow;
  }
  python -m uvicorn main:app --reload --port 8000
"

# 2. Start React Frontend in a new terminal window
Write-Host "[+] Launching React Frontend (Vite) on http://localhost:5173..." -ForegroundColor Blue
Start-Process powershell -WorkingDirectory "c:\projects\Maximize\frontend" -ArgumentList "-NoExit", "-Command", "
  Write-Host '--- React Frontend Dev Server ---' -ForegroundColor Blue;
  npm run dev
"

# 3. Start local n8n instance in a new terminal window
Write-Host "[+] Launching Local n8n Server..." -ForegroundColor Green
Start-Process powershell -WorkingDirectory "c:\projects\Maximize" -ArgumentList "-NoExit", "-Command", "
  Write-Host '--- n8n Automation Engine ---' -ForegroundColor Green;
  Write-Host 'Starting n8n via npx... (This might prompt to download npx packages if running first time)' -ForegroundColor Gray;
  npx n8n
"

Write-Host "==================================================" -ForegroundColor Magenta
Write-Host "All instances booted in separate terminal windows." -ForegroundColor Green
Write-Host "- Frontend: http://localhost:5173" -ForegroundColor Blue
Write-Host "- Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "- n8n Console: Check the n8n terminal for your local dashboard link" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Magenta
Write-Host "To shut down, close the spawned PowerShell windows." -ForegroundColor Gray
