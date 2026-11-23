@echo off
cd /d "%~dp0"
where mitmdump >nul 2>&1
if errorlevel 1 (
 echo Please install mitmproxy for Windows from https://mitmproxy.org/
 pause
 exit /b 1
)
mitmdump --quiet --listen-host 127.0.0.1 --listen-port 8080 -s "%~dp0g1_inspector.py"
pause
