// middleware/authorization.js
const { defineAbilitiesFor } = require('../abilities/ability');
const User = require('../models/user');

/**
 * Middleware pour vérifier les permissions CASL
 * @param {string} action - Action à vérifier (create, read, update, delete, manage)
 * @param {string} subject - Ressource à vérifier (Activite, Etape, User, etc.)
 * @param {string} [field] - Champ spécifique (optionnel)
 */
function authorize(action, subject, field = null) {
  return async (req, res, next) => {
    try {
      // L'utilisateur doit être authentifié avant d'arriver ici
      if (!req.user || !req.user.mail) {
        return res.status(401).json({
          error: "Non authentifié"
        });
      }

      // Utiliser les données de session si disponibles, sinon requête DB
      let utilisateur;
      if (req.user.role && req.user.nom && req.user.prenom) {
        // Données complètes déjà en session
        utilisateur = req.user;
      } else {
        // Récupérer les infos complètes de l'utilisateur depuis la DB
        utilisateur = await User.findOne({ mail: req.user.mail });
        
        if (!utilisateur) {
          return res.status(401).json({
            error: "Utilisateur non trouvé dans la base de données"
          });
        }
      }

      // Définir les capacités de l'utilisateur
      const ability = defineAbilitiesFor(utilisateur);

      // Vérifier la permission
      let canPerform;
      if (field) {
        canPerform = ability.can(action, subject, field);
      } else {
        canPerform = ability.can(action, subject);
      }

      if (!canPerform) {
        return res.status(403).json({
          error: "Accès refusé - permissions insuffisantes",
          required: `${action} ${subject}`,
          userRole: utilisateur.role
        });
      }

      // Ajouter l'utilisateur complet et ses capacités à req
      req.currentUser = utilisateur;
      req.ability = ability;
      
      next();
      
    } catch (error) {
      return res.status(500).json({
        error: "Erreur interne du serveur"
      });
    }
  };
}

/**
 * Middleware pour vérifier si l'utilisateur peut accéder à une ressource spécifique
 * Utile pour les routes avec des IDs
 */
function authorizeResource(action, subject, getResourceFn) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.mail) {
        return res.status(401).json({
          error: "Non authentifié"
        });
      }

      const utilisateur = await User.findOne({ mail: req.user.mail });
      if (!utilisateur) {
        return res.status(401).json({
          error: "Utilisateur non trouvé"
        });
      }

      const ability = defineAbilitiesFor(utilisateur);

      // Récupérer la ressource spécifique
      let resource = null;
      if (getResourceFn) {
        resource = await getResourceFn(req);
      }

      // Vérifier la permission sur la ressource
      const canPerform = ability.can(action, subject, resource);

      if (!canPerform) {
        console.log(`❌ Permission refusée sur ressource: ${utilisateur.mail} ne peut pas ${action} ${subject}`);
        return res.status(403).json({
          error: "Accès refusé à cette ressource",
          required: `${action} ${subject}`,
          userRole: utilisateur.role
        });
      }

      req.currentUser = utilisateur;
      req.ability = ability;
      req.resource = resource;
      
      console.log(`✅ Permission accordée sur ressource: ${utilisateur.mail} peut ${action} ${subject}`);
      next();
      
    } catch (error) {
      console.error("Erreur dans le middleware d'autorisation de ressource:", error);
      return res.status(500).json({
        error: "Erreur interne du serveur"
      });
    }
  };
}

module.exports = { authorize, authorizeResource };