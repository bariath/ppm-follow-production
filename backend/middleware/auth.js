const User = require('../models/user');

module.exports = function isAuthenticated(req, res, next) {
  // Vérifier si la session existe et contient les informations utilisateur
  if (req.session && req.session.user) {
    const { access_token, mail, loginTime } = req.session.user;
    
    // Vérifier que les données essentielles sont présentes
    if (!access_token || !mail) {
      req.session.destroy(); // Nettoyer la session corrompue
      return res.status(401).json({ 
        error: "Session invalide - données utilisateur incomplètes" 
      });
    }
    
    // Optionnel: Vérifier l'expiration de la session (par exemple 24h)
    if (loginTime) {
      const sessionAge = Date.now() - loginTime;
      const maxAge = 24 * 60 * 60 * 1000; // 24 heures
      
      if (sessionAge > maxAge) {
        req.session.destroy();
        return res.status(401).json({ 
          error: "Session expirée - veuillez vous reconnecter" 
        });
      }
    }
    
    // Ajouter l'utilisateur à req pour un accès facile dans les contrôleurs
    req.user = req.session.user;
    
    return next();
  } else {
    // Pas de session ou session vide
    return res.status(401).json({ 
      error: "Non authentifié - veuillez vous connecter" 
    });
  }
};