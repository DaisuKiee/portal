@echo off
echo ========================================
echo Installing expo-notifications
echo ========================================
echo.

npm install expo-notifications

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run: npx expo prebuild --clean
echo 2. Run: npx expo run:android
echo.
echo This will rebuild the app with notification permissions.
echo After rebuilding, the system permission dialog will appear.
echo.
pause
