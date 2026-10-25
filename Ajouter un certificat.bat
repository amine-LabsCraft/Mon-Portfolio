@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Ajout de certificats au portfolio
echo Images lues dans : %~dp0nouveaux-certificats
echo.
python tools\ajouter_certificat.py
echo.
pause
