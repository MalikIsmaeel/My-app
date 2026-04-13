@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title APK RELEASE BUILDER

REM ====== CONFIG ======
set "PROJECT_DIR=D:\My-app"
set "OUTPUT_DIR=D:\Builds"
set "APP_NAME=MyApp"
set "SDK_PATH=C:\Users\Eng MalikIsmaeel\AppData\Local\Android\Sdk"

REM ====== COUNTERS ======
set "STEPS_TOTAL=9"
set "STEPS_PASSED=0"

REM ====== INIT VARIABLES ======
set "JAVA_MAJOR="
set "JAVA_BITS=64"
set "GRADLE_VERSION="
set "WIN_FULL="
set "COMMIT=no-git"
set "TIMESTAMP="
set "appname=my-app"
set "APK_SIZE=0"
set "FINAL_SIZE=0"
set "NEW_NAME="

REM ====== LOG FILE ======
for /f "tokens=2 delims==" %%a in ('wmic os get localdatetime /value 2^>nul') do set "DT=%%a"
if "!DT!"=="" (
    set "LOG_FILE=%~dp0build_log.txt"
) else (
    set "LOG_FILE=%~dp0build_log_!DT:~0,8!_!DT:~8,6!.txt"
)

echo.
echo =========================================
echo   APK RELEASE BUILDER - FULL VALIDATION
echo =========================================
echo   Log: !LOG_FILE!
echo =========================================
echo.
call :LOG "BUILD STARTED - %date% %time%"
call :LOG "PROJECT_DIR: %PROJECT_DIR%"

REM ══════════════════════════════
REM STEP 1: Check Java
REM ══════════════════════════════
echo [1/%STEPS_TOTAL%] Checking Java...
call :LOG "STEP 1: Check Java"

where java >nul 2>&1
if errorlevel 1 (
    echo [1] FAILED - Java not found in PATH
    echo     Fix: Download JDK from https://adoptium.net
    call :LOG "FAIL: Java not found"
    goto :REPORT
)

REM استخراج إصدار Java بطريقة موثوقة
for /f "tokens=*" %%v in ('java -version 2^>^&1') do (
    if "!JAVA_VER_RAW!"=="" set "JAVA_VER_RAW=%%v"
)
call :LOG "  java -version output: !JAVA_VER_RAW!"

REM استخراج الرقم من النص مثل: "17.0.9" أو "1.8.0_392"
for /f "tokens=3 delims= " %%v in ('java -version 2^>^&1 ^| findstr /i "version"') do (
    set "JAVA_VER_CLEAN=%%v"
    set "JAVA_VER_CLEAN=!JAVA_VER_CLEAN:"=!"
)

for /f "tokens=1 delims=." %%a in ("!JAVA_VER_CLEAN!") do set "JAVA_MAJOR=%%a"
if "!JAVA_MAJOR!"=="1" (
    for /f "tokens=2 delims=." %%a in ("!JAVA_VER_CLEAN!") do set "JAVA_MAJOR=%%a"
)

call :LOG "  Java major version: !JAVA_MAJOR!"

if "!JAVA_MAJOR!"=="" (
    echo [1] FAILED - Could not detect Java version
    call :LOG "FAIL: Could not parse Java version"
    goto :REPORT
)

set "JAVA_OK=0"
for %%j in (8 11 17 21) do (
    if "!JAVA_MAJOR!"=="%%j" set "JAVA_OK=1"
)
if "!JAVA_OK!"=="0" (
    echo [1] FAILED - Java !JAVA_MAJOR! is not supported
    echo     Supported versions: 8, 11, 17, 21
    call :LOG "FAIL: Java !JAVA_MAJOR! not supported"
    goto :REPORT
)

java -d64 -version >nul 2>&1
if errorlevel 1 (set "JAVA_BITS=32") else (set "JAVA_BITS=64")

set /a "STEPS_PASSED+=1"
call :LOG "PASS: Java !JAVA_MAJOR! (!JAVA_BITS!-bit)"
echo [1] PASSED - Java !JAVA_MAJOR! (!JAVA_BITS!-bit)

REM ══════════════════════════════
REM STEP 2: Check OS Compatibility
REM ══════════════════════════════
echo [2/%STEPS_TOTAL%] Checking OS compatibility...
call :LOG "STEP 2: Check OS"

for /f "tokens=2 delims=[]" %%a in ('ver') do set "WIN_FULL=%%a"
call :LOG "  Windows: !WIN_FULL!"

REM فحص Windows 7/8 مع Java 21
echo !WIN_FULL! | findstr /c:"6.1" /c:"6.2" /c:"6.3" >nul 2>&1
if not errorlevel 1 (
    if "!JAVA_MAJOR!"=="21" (
        echo [2] FAILED - Java 21 is incompatible with Windows 7/8
        echo     Fix: Use Java 17 or upgrade to Windows 10/11
        call :LOG "FAIL: Java 21 + Windows 7/8 incompatible"
        goto :REPORT
    )
)

REM فحص Java 32-bit مع Java 17+
if "!JAVA_BITS!"=="32" (
    if !JAVA_MAJOR! GEQ 17 (
        echo [2] FAILED - Java !JAVA_MAJOR! 32-bit cannot run with Gradle 8+
        echo     Fix: Install 64-bit JDK from https://adoptium.net
        call :LOG "FAIL: Java !JAVA_MAJOR! 32-bit + Gradle 8 incompatible"
        goto :REPORT
    )
)

set /a "STEPS_PASSED+=1"
call :LOG "PASS: OS compatible"
echo [2] PASSED - Windows: !WIN_FULL!

REM ══════════════════════════════
REM STEP 3: Select Gradle Version
REM ══════════════════════════════
echo [3/%STEPS_TOTAL%] Selecting Gradle for Java !JAVA_MAJOR!...
call :LOG "STEP 3: Select Gradle"

if "!JAVA_MAJOR!"=="8"  set "GRADLE_VERSION=7.6.4"
if "!JAVA_MAJOR!"=="11" set "GRADLE_VERSION=7.6.4"
if "!JAVA_MAJOR!"=="17" set "GRADLE_VERSION=8.5"
if "!JAVA_MAJOR!"=="21" set "GRADLE_VERSION=8.13"

if "!GRADLE_VERSION!"=="" (
    echo [3] FAILED - No compatible Gradle for Java !JAVA_MAJOR!
    call :LOG "FAIL: No Gradle for Java !JAVA_MAJOR!"
    goto :REPORT
)

set /a "STEPS_PASSED+=1"
call :LOG "PASS: Gradle !GRADLE_VERSION! for Java !JAVA_MAJOR!"
echo [3] PASSED - Gradle !GRADLE_VERSION! selected for Java !JAVA_MAJOR!

REM ══════════════════════════════
REM STEP 4: Check Project
REM ══════════════════════════════
echo [4/%STEPS_TOTAL%] Checking project at: %PROJECT_DIR%
call :LOG "STEP 4: Check project"

REM الانتقال للمشروع مباشرة من CONFIG بدون سؤال
cd /d "%PROJECT_DIR%" 2>nul
if errorlevel 1 (
    echo [4] FAILED - Project folder not found: %PROJECT_DIR%
    echo     Fix: Update PROJECT_DIR at the top of this script
    call :LOG "FAIL: cd to %PROJECT_DIR% failed"
    goto :REPORT
)
call :LOG "  Working dir: %cd%"

if not exist "package.json" (
    echo [4] FAILED - package.json not found in %PROJECT_DIR%
    call :LOG "FAIL: package.json missing"
    goto :REPORT
)

if not exist "app.json" (
    echo [4] FAILED - app.json not found in %PROJECT_DIR%
    call :LOG "FAIL: app.json missing"
    goto :REPORT
)

if not exist "android\gradlew.bat" (
    echo [4] FAILED - android\gradlew.bat not found
    echo     Fix: Run 'npx expo prebuild --platform android' first
    call :LOG "FAIL: gradlew.bat missing"
    goto :REPORT
)

REM فحص android.package
node -e "try{var a=require('./app.json');var p=a&&a.expo&&a.expo.android&&a.expo.android.package;if(!p||String(p).trim()==='')process.exit(1);}catch(e){process.exit(1);}" >nul 2>&1
if errorlevel 1 (
    echo [4] FAILED - android.package not found in app.json
    echo     Fix: Add "package": "com.yourname.appname" inside expo.android
    call :LOG "FAIL: android.package missing"
    goto :REPORT
)

REM استخراج اسم التطبيق
for /f "delims=" %%a in ('node -e "try{var a=require('./app.json');process.stdout.write(String(a.expo.name));}catch(e){process.stdout.write('my-app');}" 2^>nul') do set "appname=%%a"
if "!appname!"=="" set "appname=my-app"

set /a "STEPS_PASSED+=1"
call :LOG "PASS: Project OK - !appname!"
echo [4] PASSED - Project: !appname!

REM ══════════════════════════════
REM STEP 5: Apply Gradle Version
REM ══════════════════════════════
echo [5/%STEPS_TOTAL%] Applying Gradle !GRADLE_VERSION!...
call :LOG "STEP 5: Apply Gradle"

set "GRADLE_PROPS=android\gradle\wrapper\gradle-wrapper.properties"
if not exist "!GRADLE_PROPS!" (
    echo [5] FAILED - gradle-wrapper.properties not found
    call :LOG "FAIL: !GRADLE_PROPS! missing"
    goto :REPORT
)

for /f "tokens=*" %%l in ('findstr "distributionUrl" "!GRADLE_PROPS!" 2^>nul') do (
    echo     Before: %%l
    call :LOG "  Before: %%l"
)

powershell -NoProfile -Command ^
    "(Get-Content '!GRADLE_PROPS!') -replace 'distributionUrl=.*', 'distributionUrl=https\://services.gradle.org/distributions/gradle-!GRADLE_VERSION!-bin.zip' | Set-Content '!GRADLE_PROPS!'"

if errorlevel 1 (
    echo [5] FAILED - Could not update gradle-wrapper.properties
    call :LOG "FAIL: powershell Set-Content failed"
    goto :REPORT
)

findstr "gradle-!GRADLE_VERSION!" "!GRADLE_PROPS!" >nul 2>&1
if errorlevel 1 (
    echo [5] FAILED - Gradle version not applied correctly
    call :LOG "FAIL: version not found after applying"
    goto :REPORT
)

for /f "tokens=*" %%l in ('findstr "distributionUrl" "!GRADLE_PROPS!" 2^>nul') do (
    echo     After : %%l
    call :LOG "  After: %%l"
)

set /a "STEPS_PASSED+=1"
call :LOG "PASS: Gradle !GRADLE_VERSION! applied"
echo [5] PASSED - Gradle !GRADLE_VERSION! applied

REM ══════════════════════════════
REM STEP 6: Check Android SDK
REM ══════════════════════════════
echo [6/%STEPS_TOTAL%] Checking Android SDK...
call :LOG "STEP 6: Check SDK at: !SDK_PATH!"

set "SDK_ERRORS="

if not exist "!SDK_PATH!"                        set "SDK_ERRORS=!SDK_ERRORS! sdk-root-missing"
if not exist "!SDK_PATH!\platforms"              set "SDK_ERRORS=!SDK_ERRORS! platforms-missing"
if not exist "!SDK_PATH!\build-tools"            set "SDK_ERRORS=!SDK_ERRORS! build-tools-missing"
if not exist "!SDK_PATH!\platform-tools\adb.exe" set "SDK_ERRORS=!SDK_ERRORS! adb-missing"

set "API_FOUND=0"
set "API_LEVEL=none"
for %%v in (35 34 33 32 31) do (
    if exist "!SDK_PATH!\platforms\android-%%v" (
        if "!API_FOUND!"=="0" (
            set "API_FOUND=1"
            set "API_LEVEL=%%v"
        )
    )
)
if "!API_FOUND!"=="0" set "SDK_ERRORS=!SDK_ERRORS! no-api-level"

set "BT_FOUND=0"
set "BT_VER=none"
for /d %%d in ("!SDK_PATH!\build-tools\3*") do (
    if "!BT_FOUND!"=="0" (
        set "BT_FOUND=1"
        set "BT_VER=%%~nxd"
    )
)
if "!BT_FOUND!"=="0" set "SDK_ERRORS=!SDK_ERRORS! no-build-tools"

if defined SDK_ERRORS (
    echo [6] FAILED - Android SDK issues:
    for %%e in (!SDK_ERRORS!) do (
        if "%%e"=="sdk-root-missing"    echo     - SDK root folder not found: !SDK_PATH!
        if "%%e"=="platforms-missing"   echo     - SDK\platforms folder missing
        if "%%e"=="build-tools-missing" echo     - SDK\build-tools folder missing
        if "%%e"=="adb-missing"         echo     - platform-tools\adb.exe not found
        if "%%e"=="no-api-level"        echo     - No API level 31-35 installed
        if "%%e"=="no-build-tools"      echo     - No build-tools version found
    )
    echo     Fix: Open Android Studio - SDK Manager
    call :LOG "FAIL: SDK errors -!SDK_ERRORS!"
    goto :REPORT
)

REM كتابة local.properties
(
    echo sdk.dir=!SDK_PATH:\=\\!
    echo android.useAndroidX=true
    echo android.enableJetifier=true
) > android\local.properties
call :LOG "  local.properties written"

set /a "STEPS_PASSED+=1"
call :LOG "PASS: SDK OK - API !API_LEVEL! - build-tools !BT_VER!"
echo [6] PASSED - SDK OK (API !API_LEVEL!, build-tools !BT_VER!)

REM ══════════════════════════════
REM STEP 7: Git + Timestamp
REM ══════════════════════════════
echo [7/%STEPS_TOTAL%] Reading Git commit and timestamp...
call :LOG "STEP 7: Git + Timestamp"

for /f "delims=" %%i in ('git rev-parse --short HEAD 2^>nul') do set "COMMIT=%%i"
if "!COMMIT!"=="" (
    set "COMMIT=no-git"
    echo     WARNING: Git not found, using "no-git"
    call :LOG "  WARNING: git not found"
) else (
    echo     Commit: !COMMIT!
    call :LOG "  Commit: !COMMIT!"
)

REM الـ DT تم قراءته في بداية السكربت لإنشاء اسم الـ log
if "!DT!"=="" (
    echo [7] FAILED - Could not read system datetime
    call :LOG "FAIL: wmic datetime empty"
    goto :REPORT
)
set "TIMESTAMP=!DT:~0,4!!DT:~4,2!!DT:~6,2!_!DT:~8,2!!DT:~10,2!!DT:~12,2!"

set /a "STEPS_PASSED+=1"
call :LOG "PASS: Commit=!COMMIT! Timestamp=!TIMESTAMP!"
echo [7] PASSED - Commit: !COMMIT! / Timestamp: !TIMESTAMP!

REM ══════════════════════════════
REM STEP 8: Gradle Build
REM ══════════════════════════════
echo [8/%STEPS_TOTAL%] Building APK Release...
echo     This may take several minutes...
call :LOG "STEP 8: Gradle build"

cd "%PROJECT_DIR%\android"
call gradlew.bat assembleRelease --no-daemon >> "..\!LOG_FILE!" 2>&1
set "GRADLE_CODE=!errorlevel!"
cd /d "%PROJECT_DIR%"

call :LOG "  Gradle exit code: !GRADLE_CODE!"

if !GRADLE_CODE! neq 0 (
    echo [8] FAILED - Gradle build error (exit code: !GRADLE_CODE!)
    echo.
    echo     Last 15 error lines:
    echo     ----------------------------------------
    powershell -NoProfile -Command "Get-Content '!LOG_FILE!' | Where-Object {$_ -match '[Ee]rror|FAILED|Exception|Could not'} | Select-Object -Last 15"
    echo     ----------------------------------------
    echo     Full log: !LOG_FILE!
    call :LOG "FAIL: Gradle exit code !GRADLE_CODE!"
    goto :REPORT
)

set /a "STEPS_PASSED+=1"
call :LOG "PASS: Gradle build success"
echo [8] PASSED - Build successful

REM ══════════════════════════════
REM STEP 9: Validate and Copy APK
REM ══════════════════════════════
echo [9/%STEPS_TOTAL%] Validating and copying APK...
call :LOG "STEP 9: Validate and copy APK"

set "APK_PATH="
for /r "%PROJECT_DIR%\android\app\build\outputs\apk\release" %%f in (*.apk) do (
    set "APK_PATH=%%f"
)
call :LOG "  APK found at: !APK_PATH!"

if "!APK_PATH!"=="" (
    echo [9] FAILED - APK not found after build
    echo     Expected: %PROJECT_DIR%\android\app\build\outputs\apk\release\*.apk
    call :LOG "FAIL: APK not found"
    goto :REPORT
)

for %%f in ("!APK_PATH!") do set "APK_SIZE=%%~zf"
call :LOG "  APK size: !APK_SIZE! bytes"

if !APK_SIZE! LSS 1000000 (
    echo [9] FAILED - APK too small: !APK_SIZE! bytes (possibly corrupted)
    call :LOG "FAIL: APK too small: !APK_SIZE! bytes"
    goto :REPORT
)

set "NEW_NAME=%APP_NAME%_!COMMIT!_!TIMESTAMP!.apk"
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

copy "!APK_PATH!" "%OUTPUT_DIR%\!NEW_NAME!" >nul 2>&1
if errorlevel 1 (
    echo [9] FAILED - Could not copy APK to %OUTPUT_DIR%
    call :LOG "FAIL: copy APK failed"
    goto :REPORT
)

if not exist "%OUTPUT_DIR%\!NEW_NAME!" (
    echo [9] FAILED - APK not found in output folder after copy
    call :LOG "FAIL: APK missing after copy"
    goto :REPORT
)

for %%f in ("%OUTPUT_DIR%\!NEW_NAME!") do set "FINAL_SIZE=%%~zf"
call :LOG "  Final APK size: !FINAL_SIZE! bytes"

if !FINAL_SIZE! NEQ !APK_SIZE! (
    echo [9] FAILED - APK size mismatch: original=!APK_SIZE! copy=!FINAL_SIZE!
    call :LOG "FAIL: size mismatch !APK_SIZE! vs !FINAL_SIZE!"
    goto :REPORT
)

set /a "STEPS_PASSED+=1"
call :LOG "PASS: APK OK - !NEW_NAME! (!FINAL_SIZE! bytes)"
echo [9] PASSED - APK ready: !FINAL_SIZE! bytes

REM ══════════════════════════════
REM REPORT
REM ══════════════════════════════
:REPORT
echo.
echo =========================================
echo   RESULT: !STEPS_PASSED!/%STEPS_TOTAL% steps passed
echo -----------------------------------------
echo   Java      : !JAVA_MAJOR! (!JAVA_BITS!-bit)
echo   Gradle    : !GRADLE_VERSION!
echo   Windows   : !WIN_FULL!
echo   Project   : !appname!
echo   Commit    : !COMMIT!
echo   Timestamp : !TIMESTAMP!
echo   Log       : !LOG_FILE!
echo =========================================

if !STEPS_PASSED! EQU %STEPS_TOTAL% (
    color 0A
    echo.
    echo   BUILD COMPLETE
    echo   File : %OUTPUT_DIR%\!NEW_NAME!
    echo   Size : !FINAL_SIZE! bytes
    echo.
    call :LOG "RESULT: ALL PASSED (!STEPS_PASSED!/%STEPS_TOTAL%)"
) else (
    color 0C
    set /a "FAILED_COUNT=%STEPS_TOTAL%-!STEPS_PASSED!"
    echo.
    echo   BUILD FAILED - !FAILED_COUNT! step(s) failed
    echo   Review errors above or check: !LOG_FILE!
    echo.
    call :LOG "RESULT: FAILED (!STEPS_PASSED!/%STEPS_TOTAL%)"
)

echo =========================================
pause
exit /b 0

REM ══════════════════════════════
REM Functions
REM ══════════════════════════════
:PASS
set /a "STEPS_PASSED+=1"
call :LOG "  PASS: %~1"
exit /b 0

:FAIL
call :LOG "  FAIL: %~1 - %~2"
exit /b 0

:LOG
echo [%time%] %~1 >> "!LOG_FILE!" 2>nul
exit /b 0