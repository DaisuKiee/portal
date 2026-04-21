@echo off
echo ========================================
echo Allow Port 5000 Through Firewall
echo ========================================
echo.
echo This will add a firewall rule to allow incoming connections on port 5000
echo You need to run this as Administrator
echo.
pause

netsh advfirewall firewall add rule name="Node.js Server Port 5000" dir=in action=allow protocol=TCP localport=5000

if %errorlevel% equ 0 (
    echo.
    echo ✓ Firewall rule added successfully!
    echo Port 5000 is now open for incoming connections.
) else (
    echo.
    echo ✗ Failed to add firewall rule.
    echo Please run this file as Administrator:
    echo Right-click on ALLOW_PORT_5000.bat and select "Run as administrator"
)

echo.
pause
