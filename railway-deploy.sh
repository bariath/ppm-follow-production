#!/bin/bash

echo "🚀 Préparation du déploiement Railway..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Exécutez ce script depuis la racine du projet"
    exit 1
fi

echo "📦 Installation des dépendances..."

# Backend
echo "🔧 Installation backend..."
cd backend
npm install
cd ..

# Frontend
echo "🎨 Installation frontend..."
cd frontend
npm install
echo "🏗️ Build du frontend..."
npm run build
cd ..

echo "✅ Préparation terminée !"
echo ""
echo "🚀 PROCHAINES ÉTAPES POUR RAILWAY :"
echo ""
echo "1. 🌐 Allez sur https://railway.app"
echo "2. 🔐 Connectez-vous avec GitHub"
echo "3. ➕ Cliquez sur 'New Project'"
echo "4. 📁 Choisissez 'Deploy from GitHub repo'"
echo "5. 🎯 Sélectionnez votre repository 'ppm-follow'"
echo "6. 🗄️ Ajoutez MongoDB : '+ New' → 'Database' → 'MongoDB'"
echo "7. ⚙️ Configurez les variables d'environnement :"
echo "   - NODE_ENV=production"
echo "   - DB_URI=\${{MongoDB.MONGODB_URL}}"
echo "   - SESSION_SECRET=your-super-secret-key-here"
echo "   - VITE_FRONTEND_URL=\${{RAILWAY_PUBLIC_DOMAIN}}"
echo "   - VITE_BACKEND_URL=\${{RAILWAY_PUBLIC_DOMAIN}}"
echo ""
echo "8. 🚀 Railway déploiera automatiquement !"
echo ""
echo "📖 Consultez README-RAILWAY.md pour plus de détails"
