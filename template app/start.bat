@echo off
echo =========================================
echo Starting FitPulse V2...
echo =========================================

echo Starting Backend Server (Port 3000)...
start "FitPulse Backend" cmd /k "node server/server.js"

echo Starting Frontend Server (Port 5500)...
start "FitPulse Frontend" cmd /k "npx serve -l 5500"

echo =========================================
echo Both servers have been started in new windows!
echo Please open your browser and go to:
echo http://localhost:5500
echo =========================================
pause
