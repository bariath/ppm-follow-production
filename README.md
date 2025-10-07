# 🚀 PPM Follow - Production

## 📋 Description
Version de production de l'application PPM Follow, optimisée pour le déploiement sur Railway.

## 🏗️ Architecture
- **Backend** : Node.js + Express + MongoDB
- **Frontend** : Vue.js 3 + Vite
- **Base de données** : MongoDB (Railway)
- **Déploiement** : Railway.app

## 🚀 Déploiement rapide

### Prérequis
- Compte GitHub
- Compte Railway (gratuit)

### Étapes
1. **Fork ce repository**
2. **Connectez-vous sur [Railway.app](https://railway.app)**
3. **Importez ce repository**
4. **Ajoutez MongoDB** dans Railway
5. **Configurez les variables d'environnement**
6. **Déployez !**

## ⚙️ Variables d'environnement
```
NODE_ENV=production
DB_URI=${{MongoDB.MONGODB_URL}}
SESSION_SECRET=your-super-secret-key-here
VITE_FRONTEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
VITE_BACKEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

## 📖 Documentation
- [Guide Railway complet](README-RAILWAY.md)
- [Script de déploiement](railway-deploy.sh)

## 🛠️ Développement local
```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm run dev
```

## 📊 Fonctionnalités
- ✅ Gestion des activités
- ✅ Suivi des étapes
- ✅ Statistiques avancées
- ✅ Gestion des utilisateurs
- ✅ Vidéos d'aide
- ✅ Rapports et exports

## 🔒 Sécurité
- Authentification OAuth2
- Sessions sécurisées
- Permissions basées sur les rôles (CASL)
- Validation des données
- Upload sécurisé

## 📈 Monitoring
- Logs structurés (Pino)
- Gestion d'erreurs centralisée
- Health checks
- Métriques Railway

---
**Version** : Production Ready  
**Dernière mise à jour** : $(date)  
**Status** : ✅ Prêt pour le déploiement
