@echo off
setlocal EnableExtensions DisableDelayedExpansion
title Mock Portal - launcher
cd /d "%~dp0"

set "EXPECTED_LT_VERSION=2.0.2"
set "LT_CMD="
set "LT_VERSION="

for /f "delims=" %%P in ('where lt.cmd 2^>nul') do if not defined LT_CMD set "LT_CMD=%%~fP"

if not defined LT_CMD (
  echo ============================================================
  echo   Tunnel not started: reviewed LocalTunnel CLI required
  echo ============================================================
  echo.
  echo This launcher never downloads npm packages automatically.
  echo Install and review localtunnel %EXPECTED_LT_VERSION% separately, then make
  echo its lt.cmd launcher available on PATH before trying again.
  echo.
  echo Expected version: %EXPECTED_LT_VERSION%
  exit /b 1
)

for /f "delims=" %%V in ('call "%LT_CMD%" --version 2^>nul') do if not defined LT_VERSION set "LT_VERSION=%%V"

if /i not "%LT_VERSION%"=="%EXPECTED_LT_VERSION%" (
  echo ============================================================
  echo   Tunnel not started: LocalTunnel version mismatch
  echo ============================================================
  echo.
  echo Resolved CLI:      %LT_CMD%
  echo Expected version: %EXPECTED_LT_VERSION%
  echo Observed version: %LT_VERSION%
  echo.
  echo Review and install the expected version explicitly before retrying.
  exit /b 1
)

echo ============================================================
echo   Mock Portal - starting server + public tunnel
echo ============================================================
echo.
echo LocalTunnel CLI: %LT_CMD%
echo Verified version: %LT_VERSION%
echo.
echo Keeping the two windows that open. Close them to stop hosting.
echo.
start "Server (port 8080)" /min python "%~dp0server.py" 8080
timeout /t 2 >nul
start "Tunnel (LocalTunnel %EXPECTED_LT_VERSION%)" "%LT_CMD%" --port 8080 --subdomain aneeket-t5-mocks-7k2
echo.
echo   Public URL:  https://aneeket-t5-mocks-7k2.loca.lt
echo.
echo   First visit shows a loca.lt page asking for a password =
echo   your public IP. Get it at https://loca.lt/mytunnelpassword
echo.
echo   Leaderboard is shared across everyone on the tunnel
echo   (saved in leaderboard.json next to server.py).
echo.
echo This window can be closed; the two it launched keep running.
timeout /t 6 >nul
