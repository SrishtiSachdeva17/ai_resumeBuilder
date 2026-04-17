@echo off
title Install MongoDB
color 0E
echo.
echo  ================================================
echo    MongoDB Community Server - Auto Installer
echo  ================================================
echo.
echo  This will download and open MongoDB installer.
echo  During install: Choose "Complete" setup type.
echo  Make sure "Install MongoDB as a Service" is CHECKED.
echo.
echo  Downloading MongoDB installer...
echo.

:: Download MongoDB installer
curl -L "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.4-signed.msi" -o "%TEMP%\mongodb-installer.msi"

IF %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Download failed. Please manually go to:
    echo  https://www.mongodb.com/try/download/community
    echo  Download and install MongoDB Community Server.
    pause
    exit
)

echo  [OK] Downloaded. Opening installer...
msiexec /i "%TEMP%\mongodb-installer.msi"

echo.
echo  After installation completes, run START.bat
pause
