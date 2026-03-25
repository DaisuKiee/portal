@echo off
echo ========================================
echo CTU Admission Portal - APK Builder
echo ========================================
echo.

cd mobile

echo Step 1: Checking EAS CLI...
where eas >nul 2>&1
if %errorlevel% neq 0 (
    echo EAS CLI not found. Installing...
    npm install -g eas-cli
)

echo.
echo Step 2: Logging into Expo...
echo (You'll need an Expo account - sign up at expo.dev if you don't have one)
eas login

echo.
echo Step 3: Building APK...
echo This will take 10-20 minutes. You'll get a download link when done.
echo.
eas build -p android --profile preview

echo.
echo ========================================
echo Build complete! Check the link above to download your APK.
echo ========================================
pause
