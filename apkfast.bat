@echo off
setlocal enabledelayedexpansion

REM ====== CONFIG ======
set PROJECT_DIR=D:\My-app
set OUTPUT_DIR=D:\Builds
set APP_NAME=MyApp

REM ====== MOVE TO PROJECT ======
cd /d %PROJECT_DIR%

REM ====== GET GIT COMMIT ======
for /f %%i in ('git rev-parse --short HEAD') do set COMMIT=%%i

REM ====== GET DATE & TIME ======
for /f "tokens=1-3 delims=/ " %%a in ("%date%") do (
    set DD=%%a
    set MM=%%b
    set YYYY=%%c
)

for /f "tokens=1-3 delims=:." %%a in ("%time%") do (
    set HH=%%a
    set MIN=%%b
    set SEC=%%c
)

REM Remove spaces from hour
set HH=%HH: =0%

set TIMESTAMP=%YYYY%%MM%%DD%_%HH%%MIN%%SEC%

echo Building APK...
cd android

REM ====== RUN GRADLE BUILD ======
gradlew assembleRelease
pause
REM ====== FIND GENERATED APK ======
set APK_PATH=
for /r "%PROJECT_DIR%\android\app\build\outputs\apk\release" %%f in (*.apk) do (
    set APK_PATH=%%f
)

if "%APK_PATH%"=="" (
    echo ERROR: APK not found!
    pause
    exit /b
)

REM ====== CREATE NEW NAME ======
set NEW_NAME=%APP_NAME%_%COMMIT%_%TIMESTAMP%.apk

REM ====== COPY TO OUTPUT FOLDER ======
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

copy "%APK_PATH%" "%OUTPUT_DIR%\%NEW_NAME%"

echo.
echo =========================================
echo Build Complete!
echo APK saved as:
echo %OUTPUT_DIR%\%NEW_NAME%
echo =========================================
echo.

pause
