@echo off
setlocal

title KriszWheel - local server

cd /d "%~dp0"

echo ============================================================
echo KriszWheel
echo ============================================================
echo.
echo [1/2] Legfrissebb main frissitese...
echo.

where git >nul 2>&1
if errorlevel 1 (
    echo HIBA: A Git nem talalhato a PATH-ban.
    echo Telepitsd a Git-et, vagy inditsd Git-tel rendelkezo terminalbol.
    goto :error
)

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo HIBA: Ez a mappa nem Git repository.
    echo A start.bat fajlt a kriszwheel repository gyokerkonyvtarabol inditsd.
    goto :error
)

git pull --ff-only origin main
if errorlevel 1 (
    echo.
    echo HIBA: A repository frissitese nem sikerult.
    echo A helyi modositasokat a script nem torli es nem irja felul.
    echo Ellenorizd a fenti Git uzenetet.
    goto :error
)

echo.
echo [2/2] Webszerver inditasa: http://localhost:8080
echo Leallitashoz nyomj Ctrl+C-t.
echo.

where python >nul 2>&1
if not errorlevel 1 (
    python -m http.server 8080
    goto :server_end
)

where py >nul 2>&1
if not errorlevel 1 (
    py -3 -m http.server 8080
    goto :server_end
)

echo HIBA: Nem talalhato Python a PATH-ban.
echo Python 3 szukseges a lokalis webszerverhez.
goto :error

:server_end
if errorlevel 1 (
    echo.
    echo HIBA: A webszerver hibaval allt le.
    goto :error
)

goto :eof

:error
echo.
pause
exit /b 1
