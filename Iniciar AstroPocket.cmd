@echo off
cd /d "%~dp0"
echo AstroPocket / http://127.0.0.1:4173/
echo Si la consola ya esta abierta, usa esa direccion.
call npm run dev -- --open --strictPort
pause
