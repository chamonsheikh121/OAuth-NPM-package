@echo off
REM Windows batch file for publishing npm package

echo ========================================
echo   Google Auth NPM Package Publisher
echo ========================================
echo.

REM Check if logged in to npm
echo Checking NPM login status...
npm whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Not logged in to NPM
    echo Please run: npm login
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%a in ('npm whoami') do set USERNAME=%%a
echo [OK] Logged in as: %USERNAME%
echo.

REM Run build
echo Building package...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)
echo [OK] Build successful
echo.

REM Check package contents
echo Checking package contents...
call npm pack --dry-run
echo.

REM Ask for version bump
echo Select version bump type:
echo 1] patch (1.0.0 -^> 1.0.1) - Bug fixes
echo 2] minor (1.0.0 -^> 1.1.0) - New features
echo 3] major (1.0.0 -^> 2.0.0) - Breaking changes
echo 4] Skip version bump
echo.
set /p version_choice="Enter choice (1-4): "

if "%version_choice%"=="1" (
    call npm version patch
) else if "%version_choice%"=="2" (
    call npm version minor
) else if "%version_choice%"=="3" (
    call npm version major
) else if "%version_choice%"=="4" (
    echo Skipping version bump
) else (
    echo [ERROR] Invalid choice
    pause
    exit /b 1
)
echo.

REM Confirm publish
set /p confirm="Do you want to publish to NPM? [y/N]: "
if /i not "%confirm%"=="y" (
    echo Publish cancelled
    pause
    exit /b 0
)

echo.
echo [INFO] If your account has 2FA enabled, you'll need an OTP code.
echo [INFO] Open your authenticator app now.
echo.
set /p otp="Enter your 2FA code (or press Enter to skip): "

echo Publishing to NPM...
if "%otp%"=="" (
    call npm publish --access public
) else (
    call npm publish --access public --otp=%otp%
)
if %errorlevel% neq 0 (
    echo [ERROR] Publish failed
    pause
    exit /b 1
)

echo [OK] Successfully published!
echo.
echo ========================================
echo   Package Published Successfully!
echo ========================================
echo.

REM Get package info
for /f "tokens=*" %%a in ('node -p "require('./package.json').name"') do set PACKAGE_NAME=%%a
for /f "tokens=*" %%a in ('node -p "require('./package.json').version"') do set VERSION=%%a

echo Package: %PACKAGE_NAME%
echo Version: %VERSION%
echo NPM URL: https://www.npmjs.com/package/%PACKAGE_NAME%
echo.
echo Users can now install with:
echo   npm install %PACKAGE_NAME%
echo.

REM Ask about git push
if not "%version_choice%"=="4" (
    set /p git_confirm="Do you want to push to GitHub? [y/N]: "
    if /i "%git_confirm%"=="y" (
        echo Pushing to GitHub...
        git push origin main --tags
        echo [OK] Pushed to GitHub
        echo.
    )
)

echo Done!
pause
