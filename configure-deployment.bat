@echo off
setlocal enabledelayedexpansion

echo ====================================================
echo Configure GitHub Pages Deployment
echo ====================================================
echo.

REM Check if we're in the right directory
if not exist package.json (
    echo Changing to the gt3-tracker directory...
    cd gt3-tracker
    
    if not exist package.json (
        echo ERROR: Cannot find package.json. Please run this script from the project root or gt3-tracker directory.
        pause
        exit /b 1
    )
)

echo This script will configure your package.json for GitHub Pages deployment.
echo.
set /p username="Enter your GitHub username: "

if "%username%"=="" (
    echo GitHub username cannot be empty.
    pause
    exit /b 1
)

echo.
echo Adding homepage field to package.json...
echo.

REM Create a temporary file with the updated content
type package.json | findstr /v "\"homepage\":" > temp.json

REM Use PowerShell to properly handle the JSON insertion
powershell -Command "(Get-Content temp.json) -replace '\"name\": \"gt3-tracker\",', '\"name\": \"gt3-tracker\",\n  \"homepage\": \"https://%username%.github.io/gt3-tracker\",' | Set-Content package.json"

REM Remove the temporary file
del temp.json

echo.
echo Configuration complete!
echo.
echo Your package.json now includes:
echo   "homepage": "https://%username%.github.io/gt3-tracker"
echo.
echo Next steps:
echo 1. Run "run-and-deploy.bat" and choose option 4 to build and deploy
echo 2. After deployment, your site will be available at:
echo    https://%username%.github.io/gt3-tracker
echo.

pause 