@echo off
echo ========================================
echo  Wipe Emulator to Free Space
echo ========================================
echo.
echo This will delete ALL data from the emulator
echo and reset it to factory settings.
echo.
pause

echo.
echo Step 1: Closing emulator...
adb -e emu kill
timeout /t 3 /nobreak >nul

echo.
echo Step 2: Wiping emulator data...
echo This may take a few minutes...

cd %LOCALAPPDATA%\Android\Sdk\emulator
emulator -avd Medium_Phone_API_36.1 -wipe-data -no-window -no-boot-anim &

echo.
echo Waiting for emulator to initialize (30 seconds)...
timeout /t 30 /nobreak

echo.
echo Step 3: Stopping emulator...
adb -e emu kill

echo.
echo ========================================
echo  Emulator wiped successfully!
echo  Now run: npx expo start
echo ========================================
pause
