@echo off
REM Startet die FISI Lernapp auf http://localhost:8080 und öffnet sie im Browser.
REM Zum Beenden dieses Fenster schließen.
cd /d "%~dp0"
start "" http://localhost:8080
python -m http.server 8080 --bind 127.0.0.1
