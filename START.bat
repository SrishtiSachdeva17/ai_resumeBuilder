@echo off
title AI Resume Builder
color 0A

:: Get the folder where START.bat is located
set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

echo.
echo  ================================================
echo    AI Resume Builder - Auto Start
echo  ================================================
echo  Root folder: %ROOT%
echo  Backend:     %BACKEND%
echo  Frontend:    %FRONTEND%
echo  ================================================
echo.

:: Check Node.js
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Node.js not installed!
    echo  Download LTS from: https://nodejs.org
    pause & exit
)
echo  [OK] Node.js found

:: Check folders exist
IF NOT EXIST "%BACKEND%\package.json" (
    echo  [ERROR] backend folder not found at: %BACKEND%
    echo  Make sure START.bat is in the same folder as backend and frontend folders.
    pause & exit
)

IF NOT EXIST "%FRONTEND%\package.json" (
    echo  [ERROR] frontend folder not found at: %FRONTEND%
    echo  Make sure START.bat is in the same folder as backend and frontend folders.
    pause & exit
)

echo  [OK] Folders found

:: Start MongoDB
echo.
echo  [INFO] Starting MongoDB service...
net start MongoDB >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    echo  [OK] MongoDB service started
) ELSE (
    sc query MongoDB >nul 2>&1
    IF %ERRORLEVEL% EQU 0 (
        echo  [OK] MongoDB already running
    ) ELSE (
        echo  [INFO] MongoDB service not found, trying mongod.exe...
        if not exist "%USERPROFILE%\data\db" mkdir "%USERPROFILE%\data\db"
        start /min "" mongod --dbpath "%USERPROFILE%\data\db"
        timeout /t 3 >nul
        echo  [OK] mongod started
    )
)

:: Install backend packages
echo.
echo  [1/4] Checking backend packages...
cd /d "%BACKEND%"
IF NOT EXIST "node_modules" (
    echo  Installing... (first time takes 1-2 min)
    npm install --legacy-peer-deps
    IF %ERRORLEVEL% NEQ 0 (
        echo  [ERROR] Backend install failed!
        pause & exit
    )
)
echo  [OK] Backend packages ready

:: Install frontend packages
echo.
echo  [2/4] Checking frontend packages...
cd /d "%FRONTEND%"
IF NOT EXIST "node_modules" (
    echo  Installing... (first time takes 2-3 min)
    npm install --legacy-peer-deps
    IF %ERRORLEVEL% NEQ 0 (
        echo  [ERROR] Frontend install failed!
        pause & exit
    )
)
echo  [OK] Frontend packages ready

:: Start backend server
echo.
echo  [3/4] Starting Backend on port 5000...
start "ResumeAI Backend" cmd /k "cd /d "%BACKEND%" && color 0B && echo. && echo  Backend running on http://localhost:5000 && echo. && npm run dev"
timeout /t 5 >nul

:: Start frontend server
echo.
echo  [4/4] Starting Frontend on port 3000...
start "ResumeAI Frontend" cmd /k "cd /d "%FRONTEND%" && color 0D && echo. && echo  Frontend running on http://localhost:3000 && echo. && npm start"

echo.
echo  ================================================
echo   Both servers starting in new windows!
echo.
echo   Open browser: http://localhost:3000
echo   Backend API:  http://localhost:5000/api/health
echo  ================================================
echo.
echo  Keep both server windows open while using the app.
echo  Close this window when done.
echo.
pause
