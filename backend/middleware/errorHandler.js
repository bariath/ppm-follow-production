const logger = require('../logger');

/**
 * Middleware de gestion d'erreurs standardisé
 */
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.expose ? err.message : (status === 500 ? 'Erreur interne du serveur' : err.message);

  // Log selon le niveau d'erreur
  const errorContext = {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    },
    timestamp: new Date().toISOString()
  };

  if (status >= 500) {
    logger.error(errorContext, 'Erreur serveur');
  } else if (status >= 400) {
    logger.warn(errorContext, 'Erreur client');
  } else {
    logger.info(errorContext, 'Erreur informationnelle');
  }

  // Réponse d'erreur standardisée
  const response = {
    error: true,
    code,
    message,
    status,
    timestamp: new Date().toISOString()
  };

  // En développement, ajouter la stack trace
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = err.details || null;
  }

  res.status(status).json(response);
}

/**
 * Wrapper pour les fonctions async
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Créer une erreur personnalisée
 */
const createError = (message, status = 500, details = null) => {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
};

module.exports = { 
  errorHandler, 
  asyncHandler, 
  createError 
};


