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

REM Create a proper JSON update using node.js instead of text manipulation
echo const fs = require('fs'); > update-package.js
echo const package = require('./package.json'); >> update-package.js
echo package.homepage = "https://%username%.github.io/gt3-tracker"; >> update-package.js
echo package.scripts = package.scripts || {}; >> update-package.js
echo package.scripts.predeploy = "npm run build"; >> update-package.js
echo package.scripts.deploy = "gh-pages -d build"; >> update-package.js
echo fs.writeFileSync('package.json', JSON.stringify(package, null, 2)); >> update-package.js
call node update-package.js
del update-package.js

echo.
echo Configuration complete!
echo.
echo Your package.json now includes:
echo   "homepage": "https://%username%.github.io/gt3-tracker"
echo   "scripts": {
echo     ...
echo     "predeploy": "npm run build",
echo     "deploy": "gh-pages -d build"
echo   }
echo.
echo Next steps:
echo 1. Run "run-and-deploy.bat" and choose option 4 to build and deploy
echo 2. After deployment, your site will be available at:
echo    https://%username%.github.io/gt3-tracker
echo.
echo Alternatively, you can now simply run:
echo    npm run deploy
echo.

pause 