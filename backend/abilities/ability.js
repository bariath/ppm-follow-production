const { AbilityBuilder, createMongoAbility } = require('@casl/ability');

/**
 * Définit les permissions CASL pour un utilisateur donné en fonction de son rôle.
 * @param {object} user - L'objet utilisateur, doit contenir les propriétés `mail` et `role`.
 * @returns {import('@casl/ability').MongoAbility} - L'instance d'ability pour l'utilisateur.
 */
function defineAbilitiesFor(user) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (!user || !user.role) {
    // Retourne une ability vide pour les utilisateurs non authentifiés ou sans rôle.
    return build();
  }
  const role = user.role.toLowerCase();

  // Permissions définies par rôle
  switch (role) {
    case 'admin':
      // L'admin peut tout gérer
      can('manage', 'all');
      break;

    case 'manager':
      // Le manager a des permissions étendues
      can('read', ['Activite', 'Etape', 'EtapeActivite', 'SaveMapping', 'User', 'Statistique', 'Rapport', 'HelpVideo']);
      can(['create', 'update'], ['Activite', 'Etape', 'EtapeActivite', 'SaveMapping', 'User', 'HelpVideo']);
      can('delete', ['Activite', 'Etape', 'SaveMapping', 'HelpVideo']);
      cannot('delete', 'User');
      break;

    case 'user':
      // L'utilisateur standard a des droits limités
      can('read', ['Activite', 'Etape', 'EtapeActivite', 'Statistique', 'HelpVideo']);
      can('update', 'EtapeActivite'); // Peut mettre à jour l'avancement
      cannot(['create', 'delete'], 'all');
      cannot('update', ['Activite', 'Etape', 'User', 'SaveMapping', 'HelpVideo']);
      cannot('read', ['User', 'SaveMapping', 'Rapport']);
      break;

    case 'viewer':
      // L'observateur a un accès en lecture seule très restreint
      can('read', ['Activite', 'Etape', 'Statistique', 'HelpVideo']);
      cannot(['create', 'update', 'delete'], 'all');
      cannot('read', ['User', 'SaveMapping', 'Rapport', 'EtapeActivite']);
      break;
  }

  return build();
}

/**
 * Génère un objet de permissions complet à envoyer au client (frontend).
 * @param {object} user - L'objet utilisateur.
 * @returns {object} - Un objet structuré des permissions.
 */
function getUserPermissions(user) {
  const ability = defineAbilitiesFor(user);
  
  const subjects = ['Activite', 'Etape', 'EtapeActivite', 'User', 'SaveMapping', 'Statistique', 'Rapport', 'HelpVideo'];
  const actions = ['create', 'read', 'update', 'delete'];
  
  const permissions = {};
  
  subjects.forEach(subject => {
    permissions[subject] = {};
    actions.forEach(action => {
      permissions[subject][action] = ability.can(action, subject);
    });
  });
  
  return permissions;
}

module.exports = { 
  defineAbilitiesFor, 
  getUserPermissions 
};


