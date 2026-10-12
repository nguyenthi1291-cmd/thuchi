@echo off
title Quan ly Thu Chi - Web Server
echo Dang khoi dong Web Server...
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
