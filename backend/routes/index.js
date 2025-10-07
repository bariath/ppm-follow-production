const express = require("express");
const ActivitéCtrl = require("../controllers/activite");
const RapportCtrl = require("../controllers/rapport");
const StatistiqueCtrl = require("../controllers/statistique");
const etapeCtrl = require("../controllers/etape");
const etapeActiviteCtrl = require("../controllers/etapeActivite");
const MappingCtrl = require("../controllers/mapping");
const UserCtrl = require("../controllers/user");
const multer = require("multer");
const upload = require("../upload");
const callback = require("../Oauth2/oauth_callback");
const deleteCtrl = require("../controllers/delete");
const retardCtrl = require("../controllers/retard");
const { planifierEmail } = require("../controllers/emailSender");
const isAuthenticated = require("../middleware/auth");
const { authorize, authorizeResource } = require("../middleware/authorization");
const User = require("../models/user");
const { defineAbilitiesFor, getUserPermissions } = require('../abilities/ability');
// Sous-routers par domaine (modularisation progressive)
const activiteRoutes = require('./activite');
const etapeRoutes = require('./etape');
const etapeActiviteRoutes = require('./etapeActivite');
const userRoutes = require('./user');
const mappingRoutes = require('./mapping');
const rapportRoutes = require('./rapport');
const retardRoutes = require('./retard');
const adminRoutes = require('./admin');
const statistiqueRoutes = require('./statistique');
const videosRoutes = require('./videos');

const router = express.Router();

// Montage des sous-routers (conservera temporairement les routes existantes ci-dessous)
router.use(activiteRoutes);
router.use(etapeRoutes);
router.use(etapeActiviteRoutes);
router.use(userRoutes);
router.use(mappingRoutes);
router.use(rapportRoutes);
router.use(retardRoutes);
router.use(adminRoutes);
router.use(statistiqueRoutes);
router.use(videosRoutes);

// Routes de retard déplacées dans routes/retard.js

// Route d'admin déplacée dans routes/admin.js

// Routes d'activités déplacées dans routes/activite.js

// Routes de mapping déplacées dans routes/mapping.js

// getActivityById déplacée dans routes/activite.js

// Routes utilisateurs déplacées dans routes/user.js

// Routes rapports déplacées dans routes/rapport.js

// Routes étapes-activités déplacées dans routes/etapeActivite.js

// Routes étapes déplacées dans routes/etape.js

// OAuth callback - pas de vérification nécessaire
router.post("/oauth/callback", callback.callback_uri);

// Route de vérification de session - pas de vérification CASL nécessaire
router.get('/check-session', (req, res) => {
  if (req.session && req.session.user) {
    const { access_token, mail, loginTime } = req.session.user;
    
    if (!access_token || !mail) {
      console.log("❌ Session incomplète - données manquantes");
      req.session.destroy();
      return res.status(401).json({
        valid: false,
        error: "Session invalide - données utilisateur incomplètes"
      });
    }
    
    if (loginTime) {
      const sessionAge = Date.now() - loginTime;
      const maxAge = 24 * 60 * 60 * 1000; // 24 heures
      
      if (sessionAge > maxAge) {
        console.log("❌ Session expirée");
        req.session.destroy();
        return res.status(401).json({
          valid: false,
          error: "Session expirée - veuillez vous reconnecter"
        });
      }
    }
    
    console.log(`✅ Session valide pour: ${mail}`);
    return res.status(200).json({
      valid: true,
      user: {
        mail: req.session.user.mail,
        name: req.session.user.name,
        company: req.session.user.company,
        loginTime: req.session.user.loginTime
      }
    });
    
  } else {
    console.log("❌ Aucune session trouvée");
    return res.status(401).json({
      valid: false,
      error: "Non authentifié - aucune session trouvée"
    });
  }
});

// À ajouter dans votre fichier de routes principal

// Route pour récupérer les permissions de l'utilisateur connecté
router.get('/user-permissions', isAuthenticated, async (req, res) => {
  try {
    if (!req.user || !req.user.mail) {
      return res.status(401).json({
        error: "Non authentifié"
      });
    }

    // Récupérer l'utilisateur complet depuis la DB
    const utilisateur = await User.findOne({ mail: req.user.mail });
    
    if (!utilisateur) {
      return res.status(404).json({
        error: "Utilisateur non trouvé dans la base de données"
      });
    }

    // Obtenir toutes les permissions
    const permissions = getUserPermissions(utilisateur);

    // Informations utilisateur à retourner
    const userInfo = {
      mail: utilisateur.mail,
      nom: utilisateur.nom,
      role: utilisateur.role,
      permissions: permissions
    };

    console.log(`✅ Permissions récupérées pour: ${utilisateur.mail} (${utilisateur.role})`);
    
    return res.status(200).json({
      success: true,
      user: userInfo
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des permissions:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur"
    });
  }
});

// Route pour vérifier une permission spécifique
router.post('/check-permission', isAuthenticated, async (req, res) => {
  try {
    const { action, subject } = req.body;

    if (!action || !subject) {
      return res.status(400).json({
        error: "Action et subject sont requis"
      });
    }

    if (!req.user || !req.user.mail) {
      return res.status(401).json({
        error: "Non authentifié"
      });
    }

    const utilisateur = await User.findOne({ mail: req.user.mail });
    
    if (!utilisateur) {
      return res.status(404).json({
        error: "Utilisateur non trouvé"
      });
    }

    const ability = defineAbilitiesFor(utilisateur);
    const hasPermission = ability.can(action, subject);

    return res.status(200).json({
      success: true,
      hasPermission: hasPermission,
      user: {
        mail: utilisateur.mail,
        role: utilisateur.role
      },
      checked: {
        action: action,
        subject: subject
      }
    });

  } catch (error) {
    console.error("Erreur lors de la vérification de permission:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur"
    });
  }
});

module.exports = router;