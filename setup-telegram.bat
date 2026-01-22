@echo off
REM Telegram Bot Auto-Setup Script for ProchePro (Windows)
REM Run this once to configure everything automatically

echo ========================================
echo 🚀 ProchePro Telegram Bot Setup
echo ========================================
echo.

REM Check if .env exists
if not exist "backend\.env" (
    echo ❌ Error: backend\.env file not found!
    pause
    exit /b 1
)

REM Check if TELEGRAM_BOT_TOKEN is set
findstr /C:"TELEGRAM_BOT_TOKEN=" backend\.env >nul
if errorlevel 1 (
    echo ⚠️  TELEGRAM_BOT_TOKEN not found in .env
    echo.
    echo Please add your Telegram bot token to backend\.env:
    echo TELEGRAM_BOT_TOKEN=your_bot_token_here
    echo.
    echo To create a bot:
    echo 1. Open Telegram and search for @BotFather
    echo 2. Send /newbot
    echo 3. Follow the instructions
    echo 4. Copy the token and add it to .env
    echo.
    pause
    exit /b 1
)

echo ✅ Found TELEGRAM_BOT_TOKEN in .env
echo.

REM Navigate to backend
cd backend

echo 📋 Setting up bot commands and webhook...
php artisan telegram:setup

if %errorlevel% equ 0 (
    echo.
    echo ✅ Telegram bot setup completed!
    echo.
    echo 📝 Next steps:
    echo    1. Open @BotFather in Telegram
    echo    2. Send /mybots and select your bot
    echo    3. Go to 'Edit Bot' -^> 'Edit Description'
    echo    4. Paste the description from TELEGRAM_BOT_SETUP.md
    echo    5. Go to 'Edit About Text' and paste the about text
    echo    6. Upload bot avatar (512x512 PNG^) via 'Edit Botpic'
    echo.
    echo 🎉 Your bot is ready to use!
    echo.
    echo 📱 Test it: Search for your bot in Telegram and send /start
) else (
    echo.
    echo ❌ Setup failed. Please check the error messages above.
)

cd ..
pause
