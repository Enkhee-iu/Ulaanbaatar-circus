@echo off
setlocal
cd /d "%~dp0"
set "CIRCUS_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%CIRCUS_NODE%" (
  "%CIRCUS_NODE%" scripts\local.mjs dev
) else (
  node scripts\local.mjs dev
)
pause
