@echo off
echo ========================================
echo   Starting Android Emulator (Safe Mode)
echo ========================================
echo.

set ANDROID_HOME=C:\Users\swagl\AppData\Local\Android\Sdk
set EMULATOR_PATH=%ANDROID_HOME%\emulator\emulator.exe

echo Starting emulator with compatibility settings...
echo - Software GPU rendering (slower but stable)
echo - No snapshot loading
echo - Increased RAM
echo.

start "Android Emulator" "%EMULATOR_PATH%" -avd Medium_Phone_API_36.1 -gpu swiftshader_indirect -no-snapshot-load -memory 2048 -partition-size 2048

echo.
echo Emulator is starting in a new window...
echo Wait 1-2 minutes for it to fully boot.
echo.
echo If it still crashes, try these solutions:
echo 1. Open Android Studio and wipe emulator data
echo 2. Create a new AVD with lower API level (API 33 or 34)
echo 3. Use a physical device with Expo Go app instead
echo.
pause
