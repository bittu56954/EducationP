@echo off
echo ===================================================
echo   BK Teaching Centre - Backend Dependency Installer
echo ===================================================
echo.

:: 1. Force kill any lingering node processes that might lock files
echo [1/3] Closing any lingering Node.js file locks...
taskkill /f /im node.exe >nul 2>&1

:: 2. Remove corrupted folders
echo [2/3] Deleting node_modules and package-lock.json...
if exist node_modules (
    rmdir /s /q node_modules
)
if exist package-lock.json (
    del /f /q package-lock.json
)

:: 3. Run a clean install
echo [3/3] Running clean npm install...
call npm install --no-audit --no-fund

echo.
echo ===================================================
echo   Installation complete! Starting backend server...
echo ===================================================
echo.
call npm run dev
