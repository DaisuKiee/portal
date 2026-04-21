@echo off
echo Starting Android Emulator...
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

REM Start the emulator with compatibility options
echo Starting Medium_Phone_API_36.1 emulator...
echo This will open in a new window.
echo.
echo NOTE: Keep this window open while the emulator is running.
echo Press Ctrl+C to stop the emulator.
echo.

REM Try with hardware acceleration first
start "Android Emulator" "%EMULATOR_PATH%" -avd Medium_Phone_API_36.1 -gpu auto -no-snapshot-load

echo.
echo Emulator is starting...
echo Wait for the emulator to fully boot before running 'npx expo start'
echo.
pause
