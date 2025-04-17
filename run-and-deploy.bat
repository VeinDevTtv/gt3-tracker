@echo off
setlocal enabledelayedexpansion

echo ====================================================
echo Porsche GT3 Savings Tracker - Development Tools
echo ====================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js and try again.
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
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Failed to install dependencies.
        pause
        exit /b 1
    )
)

:menu
cls
echo ====================================================
echo Porsche GT3 Savings Tracker - Development Tools
echo ====================================================
echo.
echo Choose an option:
echo 1. Start development server
echo 2. Build for production
echo 3. Deploy to GitHub Pages
echo 4. Build and deploy to GitHub Pages
echo 5. Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Starting development server...
    echo.
    call npm start
    goto menu
)

if "%choice%"=="2" (
    echo.
    echo Building for production...
    echo.
    call npm run build
    
    if %ERRORLEVEL% equ 0 (
        echo.
        echo Build completed successfully. Files are in the 'build' directory.
        echo.
    ) else (
        echo.
        echo ERROR: Build failed.
        echo.
    )
    
    pause
    goto menu
)

if "%choice%"=="3" (
    echo.
    echo Deploying to GitHub Pages...
    echo.
    
    REM Check if gh-pages package is installed
    call npm list -g gh-pages >nul 2>nul
    if %ERRORLEVEL% neq 0 (
        call npm list gh-pages >nul 2>nul
        if %ERRORLEVEL% neq 0 (
            echo Installing gh-pages package...
            call npm install --save-dev gh-pages
            if %ERRORLEVEL% neq 0 (
                echo ERROR: Failed to install gh-pages package.
                pause
                goto menu
            )
        )
    )
    
    REM Deploy using npm script
    call npm run deploy
    
    if %ERRORLEVEL% equ 0 (
        echo.
        echo Deployment completed successfully.
        echo Your app should be available at the URL specified in your package.json homepage.
        echo.
    ) else (
        echo.
        echo ERROR: Deployment failed.
        echo.
    )
    
    pause
    goto menu
)

if "%choice%"=="4" (
    echo.
    echo Building and deploying to GitHub Pages...
    echo.
    
    REM Check if gh-pages package is installed
    call npm list -g gh-pages >nul 2>nul
    if %ERRORLEVEL% neq 0 (
        call npm list gh-pages >nul 2>nul
        if %ERRORLEVEL% neq 0 (
            echo Installing gh-pages package...
            call npm install --save-dev gh-pages
            if %ERRORLEVEL% neq 0 (
                echo ERROR: Failed to install gh-pages package.
                pause
                goto menu
            )
        )
    )
    
    REM Deploy using npm script (which includes build step via predeploy)
    call npm run deploy
    
    if %ERRORLEVEL% equ 0 (
        echo.
        echo Build and deployment completed successfully.
        echo Your app should be available at the URL specified in your package.json homepage.
        echo.
    ) else (
        echo.
        echo ERROR: Build or deployment failed.
        echo.
    )
    
    pause
    goto menu
)

if "%choice%"=="5" (
    echo.
    echo Exiting...
    exit /b 0
)

echo.
echo Invalid choice. Please try again.
echo.
pause
goto menu 