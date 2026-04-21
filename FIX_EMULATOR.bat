@echo off
echo ========================================
echo   Android Emulator Diagnostic Tool
echo ========================================
echo.

set ANDROID_HOME=C:\Users\swagl\AppData\Local\Android\Sdk
set EMULATOR_PATH=%ANDROID_HOME%\emulator\emulator.exe

echo [Step 1] Checking emulator installation...
if exist "%EMULATOR_PATH%" (
    echo ✓ Emulator found
) else (
    echo ✗ Emulator not found
    pause
    exit /b 1
)

echo.
echo [Step 2] Listing available AVDs...
"%EMULATOR_PATH%" -list-avds
echo.

echo [Step 3] Trying to start emulator with verbose output...
echo This will show detailed error messages.
echo.
pause

echo Starting emulator with GPU acceleration disabled (software rendering)...
echo This is slower but more compatible.
echo.

"%EMULATOR_PATH%" -avd Medium_Phone_API_36.1 -gpu swiftshader_indirect -no-snapshot-load -verbose

pause
