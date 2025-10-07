const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware de validation des entrées
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Exécuter toutes les validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Données d'entrée invalides",
        details: errors.array()
      });
    }

    next();
  };
};

/**
 * Validations pour les activités
 */
const validateActivity = [
  body('donnéesDeBase.numRéf')
    .notEmpty()
    .withMessage('Le numéro de référence est requis')
    .isLength({ min: 3, max: 50 })
    .withMessage('Le numéro de référence doit faire entre 3 et 50 caractères'),
  
  body('donnéesDeBase.description')
    .notEmpty()
    .withMessage('La description est requise')
    .isLength({ min: 5, max: 500 })
    .withMessage('La description doit faire entre 5 et 500 caractères'),
  
  body('donnéesDeBase.montantEstimatif')
    .optional()
    .isNumeric()
    .withMessage('Le montant estimatif doit être un nombre')
    .isFloat({ min: 0 })
    .withMessage('Le montant estimatif doit être positif')
];

/**
 * Validations pour les utilisateurs
 */
const validateUser = [
  body('nom')
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit faire entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-']+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  
  body('prenom')
    .notEmpty()
    .withMessage('Le prénom est requis')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit faire entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-']+$/)
    .withMessage('Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  
  body('mail')
    .isEmail()
    .withMessage('L\'email doit être valide')
    .normalizeEmail(),
  
  body('role')
    .isIn(['admin', 'manager', 'user', 'viewer'])
    .withMessage('Le rôle doit être admin, manager, user ou viewer')
];

/**
 * Validations pour les vidéos d'aide
 */
const validateHelpVideo = [
  body('title')
    .notEmpty()
    .withMessage('Le titre est requis')
    .isLength({ min: 3, max: 100 })
    .withMessage('Le titre doit faire entre 3 et 100 caractères')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La description ne peut dépasser 500 caractères')
    .trim(),
  
  body('roles')
    .isArray({ min: 1 })
    .withMessage('Au moins un rôle doit être sélectionné')
    .custom((roles) => {
      const validRoles = ['admin', 'manager', 'user', 'viewer'];
      return roles.every(role => validRoles.includes(role));
    })
    .withMessage('Les rôles doivent être parmi: admin, manager, user, viewer')
];

/**
 * Validations pour les paramètres de pagination
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un entier positif'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
  
  query('role')
    .optional()
    .isIn(['admin', 'manager', 'user', 'viewer'])
    .withMessage('Le rôle de filtre doit être valide')
];

/**
 * Validation des IDs MongoDB
 */
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('L\'ID doit être un identifiant MongoDB valide')
];

module.exports = {
  validate,
  validateActivity,
  validateUser,
  validateHelpVideo,
  validatePagination,
  validateObjectId
};
