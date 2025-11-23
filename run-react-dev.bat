@echo off
REM Go to the folder where this .bat file is located
cd /d "%~dp0"

echo Installing dependencies (if needed)...
call npm i

echo.
echo Starting dev server in a new window...
start "" cmd /k "npm run dev"

echo.
echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo Opening app in browser...
start "" "http://localhost:5173"

echo.
echo All done. You can close this window.
