#!/bin/bash

# 🤖 Telegram Bot Auto-Setup Script for ProchePro
# Run this once to configure everything automatically

echo "🚀 ProchePro Telegram Bot Setup"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env file not found!"
    exit 1
fi

# Check if TELEGRAM_BOT_TOKEN is set
if ! grep -q "TELEGRAM_BOT_TOKEN=" backend/.env; then
    echo "⚠️  TELEGRAM_BOT_TOKEN not found in .env"
    echo ""
    echo "Please add your Telegram bot token to backend/.env:"
    echo "TELEGRAM_BOT_TOKEN=your_bot_token_here"
    echo ""
    echo "To create a bot:"
    echo "1. Open Telegram and search for @BotFather"
    echo "2. Send /newbot"
    echo "3. Follow the instructions"
    echo "4. Copy the token and add it to .env"
    echo ""
    exit 1
fi

echo "✅ Found TELEGRAM_BOT_TOKEN in .env"
echo ""

# Navigate to backend
cd backend || exit 1

echo "📋 Setting up bot commands and webhook..."
php artisan telegram:setup

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Telegram bot setup completed!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Open @BotFather in Telegram"
    echo "   2. Send /mybots and select your bot"
    echo "   3. Go to 'Edit Bot' → 'Edit Description'"
    echo "   4. Paste this description:"
    echo ""
    echo "   🤖 ProchePro Bot Officiel"
    echo ""
    echo "   Recevez instantanément:"
    echo "   🔔 Nouvelles missions près de chez vous"
    echo "   💬 Messages des clients"
    echo "   ⚡ Mises à jour en temps réel"
    echo "   📊 Statistiques et solde"
    echo ""
    echo "   Connectez votre compte depuis prochepro.fr"
    echo ""
    echo "   5. Go to 'Edit About Text' and paste:"
    echo "   Bot officiel ProchePro - Notifications et gestion de missions en temps réel"
    echo ""
    echo "   6. Upload bot avatar (512x512 PNG) via 'Edit Botpic'"
    echo ""
    echo "🎉 Your bot is ready to use!"
    echo ""
    echo "📱 Test it: Search for your bot in Telegram and send /start"
else
    echo ""
    echo "❌ Setup failed. Please check the error messages above."
    exit 1
fi
