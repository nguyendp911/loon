@echo off
set "EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%EXE%" set "EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
start "" "%EXE%" --user-data-dir="%~dp0browser-profile-chrome" --proxy-server="http://127.0.0.1:8080" --disable-quic "http://mitm.it"
