@echo off
setlocal enabledelayedexpansion

echo ====================================================
echo Porsche GT3 Savings Tracker - Development Tools
echo ====================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

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

REM Check if dependencies are installed
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if !errorlevel! neq 0 (
        echo ERROR: Failed to install dependencies.
        pause
        exit /b 1
    )
    echo Dependencies installed successfully.
    echo.
)

:menu
cls
echo Porsche GT3 Savings Tracker - Development Tools
echo ====================================================
echo.
echo Choose an option:
echo 1) Start development server
echo 2) Build for production
echo 3) Deploy to GitHub Pages
echo 4) Build and deploy to GitHub Pages
echo 5) Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto start_dev
if "%choice%"=="2" goto build_prod
if "%choice%"=="3" goto deploy
if "%choice%"=="4" goto build_and_deploy
if "%choice%"=="5" goto end

echo Invalid choice. Please try again.
timeout /t 2 >nul
goto menu

:start_dev
echo.
echo Starting development server...
echo The application will be available at http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
call npm start
goto menu

:build_prod
echo.
echo Building for production...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Build failed.
    pause
    goto menu
)
echo.
echo Build completed successfully. Files are in the "build" directory.
echo.
pause
goto menu

:deploy
echo.
echo Checking if gh-pages package is installed...
call npm list gh-pages --depth=0 >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing gh-pages package...
    call npm install --save-dev gh-pages
    if !errorlevel! neq 0 (
        echo ERROR: Failed to install gh-pages package.
        pause
        goto menu
    )
)

echo.
echo Deploying to GitHub Pages...
echo This will deploy the contents of the "build" directory to gh-pages branch.
echo.
set /p confirm="Are you sure you want to deploy? (Y/N): "
if /i not "%confirm%"=="Y" goto menu

REM First check if build directory exists
if not exist build (
    echo.
    echo ERROR: Build directory not found. Please build the project first.
    echo.
    pause
    goto menu
)

REM Deploy using gh-pages
echo.
call npx gh-pages -d build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Deployment failed.
    pause
    goto menu
)
echo.
echo Deployment successful!
echo Your site should be available at https://USERNAME.github.io/gt3-tracker
echo (Replace USERNAME with your GitHub username)
echo.
pause
goto menu

:build_and_deploy
echo.
echo Building and deploying to GitHub Pages...
echo.
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Build failed.
    pause
    goto menu
)

REM Check if gh-pages package is installed
call npm list gh-pages --depth=0 >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing gh-pages package...
    call npm install --save-dev gh-pages
    if !errorlevel! neq 0 (
        echo ERROR: Failed to install gh-pages package.
        pause
        goto menu
    )
)

echo.
echo Deploying to GitHub Pages...
call npx gh-pages -d build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Deployment failed.
    pause
    goto menu
)
echo.
echo Build and deployment successful!
echo Your site should be available at https://USERNAME.github.io/gt3-tracker
echo (Replace USERNAME with your GitHub username)
echo.
pause
goto menu

:end
echo.
echo Goodbye!
echo.
exit /b 0 