@echo off
echo ========================================
echo CTU Admission Portal - Rebuild Script
echo ========================================
echo.
echo This will rebuild the app with notification permissions.
echo Make sure you have installed expo-notifications first:
echo   cd mobile
echo   npm install expo-notifications
echo.
pause

cd mobile

echo.
echo Step 1: Cleaning previous build...
call npx expo prebuild --clean

echo.
echo Step 2: Running Android build...
call npx expo run:android

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo The app should now have notification permissions.
echo Check: Settings > Apps > CTU Admission Portal > Permissions
echo.
pause
