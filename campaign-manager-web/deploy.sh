#!/bin/bash

echo "🚀 Kampanijų valdymo aplikacijos deployment script"
echo "=================================================="

# Patikrinti, ar git yra
if ! command -v git &> /dev/null; then
    echo "❌ Git nerastas. Įdiegti git pirmiausia."
    exit 1
fi

# Patikrinti, ar npm yra
if ! command -v npm &> /dev/null; then
    echo "❌ npm nerastas. Įdiegti Node.js pirmiausia."
    exit 1
fi

echo "✅ Git ir npm rasti"

# Įdiegti dependencies
echo "📦 Įdiegiami dependencies..."
npm install

# Build aplikaciją
echo "🔨 Buildinama aplikacija..."
npm run build

# Patikrinti git status
echo "📋 Git statusas:"
git status

# Patikrinti remote origin
echo "🔗 Remote origin:"
git remote -v

echo ""
echo "🎯 Dabar atlikite šiuos žingsnius:"
echo ""
echo "1. Eikite į https://vercel.com"
echo "2. Prisijunkite su GitHub"
echo "3. Spauskite 'New Project'"
echo "4. Importuokite 'rentcas-pixel/campaign-manager'"
echo "5. Spauskite 'Deploy'"
echo ""
echo "🌐 Gausite URL: https://campaign-manager-rentcas-pixel.vercel.app"
echo ""
echo "📚 Pilnos instrukcijos: DEPLOY.md faile"

