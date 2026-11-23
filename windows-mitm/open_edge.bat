@echo off
set "EXE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EXE%" set "EXE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
start "" "%EXE%" --user-data-dir="%~dp0browser-profile-edge" --proxy-server="http://127.0.0.1:8080" --disable-quic "http://mitm.it"
