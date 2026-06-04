@echo off
echo ========================================
echo  Clear Android Emulator Storage
echo ========================================
echo.

echo Closing all emulators...
adb devices | findstr emulator | for /f "tokens=1" %%i in ('more') do adb -s %%i emu kill

echo.
echo Waiting for emulators to close...
timeout /t 3 /nobreak >nul

echo.
echo Clearing emulator data...
echo This will wipe the emulator and free up space.
echo.

cd %ANDROID_HOME%\emulator
emulator -avd Medium_Phone_API_36.1 -wipe-data -no-window &

echo.
echo Waiting for emulator to initialize...
timeout /t 10 /nobreak >nul

echo.
echo Stopping emulator...
adb devices | findstr emulator | for /f "tokens=1" %%i in ('more') do adb -s %%i emu kill

echo.
echo ========================================
echo  Emulator storage cleared!
echo  You can now run: npx expo start
echo ========================================
pause
