# 🚀 Déploiement Railway - PPM Follow

## 🎯 Pourquoi Railway ?
- ✅ **MongoDB inclus** gratuitement
- ✅ **$5 de crédit/mois** gratuit
- ✅ **Déploiement en 1 clic**
- ✅ **Base de données + app** sur la même plateforme
- ✅ **SSL automatique**

## 📋 Étapes de déploiement

### 1. Créer un compte Railway
1. Allez sur [railway.app](https://railway.app)
2. Cliquez sur "Login" → "Login with GitHub"
3. Autorisez Railway à accéder à vos repos GitHub

### 2. Créer un nouveau projet
1. Cliquez sur "New Project"
2. Choisissez "Deploy from GitHub repo"
3. Sélectionnez votre repository `ppm-follow`

### 3. Ajouter MongoDB
1. Dans votre projet Railway
2. Cliquez sur "+ New"
3. Choisissez "Database" → "MongoDB"
4. Railway créera automatiquement une base MongoDB

### 4. Configurer les variables d'environnement
Dans Railway, allez dans "Variables" et ajoutez :

```
NODE_ENV=production
DB_URI=${{MongoDB.MONGODB_URL}}
SESSION_SECRET=your-super-secret-key-here
VITE_FRONTEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
VITE_BACKEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

### 5. Déployer
1. Railway détectera automatiquement votre projet
2. Il installera les dépendances
3. Il démarrera votre application
4. Votre app sera disponible sur `https://votre-app.railway.app`

## 🔧 Configuration automatique

Railway détectera automatiquement :
- ✅ **Backend Node.js** (dossier `backend/`)
- ✅ **Frontend Vue.js** (dossier `frontend/`)
- ✅ **MongoDB** (base de données)
- ✅ **Variables d'environnement**

## 📊 Monitoring
- **Logs** : Voir les logs en temps réel
- **Métriques** : CPU, RAM, réseau
- **Base de données** : Interface MongoDB intégrée

## 💰 Coûts
- **Gratuit** : $5 de crédit/mois
- **MongoDB** : Inclus gratuitement
- **Bande passante** : Incluse
- **SSL** : Automatique et gratuit

## 🚀 Avantages vs autres plateformes
- ✅ **Plus simple** que Vercel + Atlas
- ✅ **Tout intégré** : App + DB
- ✅ **Moins de configuration**
- ✅ **Monitoring intégré**
