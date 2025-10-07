#!/bin/bash

echo "🚀 Build pour Railway..."

# Installer les dépendances backend
echo "📦 Installation backend..."
cd backend
npm install --production
cd ..

# Installer les dépendances frontend et build
echo "🎨 Installation et build frontend..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Build terminé !"
