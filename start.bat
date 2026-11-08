@echo off
title SAM - Your Second Mind
echo ========================================================
echo   SAM - YOUR SECOND MIND
echo   "Your Mind Is for Living. SAM Is for Remembering."
echo ========================================================
echo.
echo Opening SAM in your default browser...
start "" "%~dp0index.html"
echo.
echo If you prefer a local HTTP server, run:
echo   python serve.py
echo.
pause

