const express = require('express');
const router = express.Router();
const UserCtrl = require('../controllers/user');
const isAuthenticated = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');

router.delete('/deleteUser', isAuthenticated, authorize('delete', 'User'), UserCtrl.deleteUser);
router.get('/utilisateursAssocies/:idActivite', isAuthenticated, authorize('read', 'User'), UserCtrl.getUtilisateursAssocies);
router.post('/associerUtilisateurActivite', isAuthenticated, authorize('update', 'Activite'), UserCtrl.associerUtilisateurActivite);
router.get('/listerUtilisateurs', isAuthenticated, authorize('read', 'User'), UserCtrl.listerUtilisateurs);
router.delete('/supprimerUtilisateur/:id', isAuthenticated, authorize('delete', 'User'), UserCtrl.supprimerUtilisateur);
router.put('/modifierUtilisateur/:id', isAuthenticated, authorize('update', 'User'), UserCtrl.modifierUtilisateur);
router.post('/creerUtilisateur', isAuthenticated, authorize('create', 'User'), UserCtrl.ajouterUtilisateur);

module.exports = router;


