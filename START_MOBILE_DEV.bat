@echo off
echo ========================================
echo   CTU Admission Mobile Development
echo ========================================
echo.

REM Set Android SDK path
set ANDROID_HOME=C:\Users\swagl\AppData\Local\Android\Sdk
set EMULATOR_PATH=%ANDROID_HOME%\emulator\emulator.exe

REM Check if emulator exists
if not exist "%EMULATOR_PATH%" (
    echo ERROR: Emulator not found at %EMULATOR_PATH%
    echo Please check your Android SDK installation.
    pause
    exit /b 1
)

echo [1/3] Starting Android Emulator...
echo.
start "Android Emulator" "%EMULATOR_PATH%" -avd Medium_Phone_API_36.1

echo Waiting for emulator to boot (30 seconds)...
echo Please wait...
timeout /t 30 /nobreak >nul

echo.
echo [2/3] Checking if backend server is running...
echo Backend should be running on http://localhost:5000
echo If not, run START_SERVER.bat in the backend folder
echo.
timeout /t 3 /nobreak >nul

echo [3/3] Starting Expo Metro Bundler...
echo.
cd mobile
npx expo start

pause
