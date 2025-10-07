const express = require('express');
const router = express.Router();
const retardCtrl = require('../controllers/retard');
const isAuthenticated = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');

router.get('/etapes-retard', isAuthenticated, authorize('read', 'Etape'), retardCtrl.etapesretard);
router.patch('/etapes/:id/terminer', isAuthenticated, authorize('update', 'EtapeActivite'), retardCtrl.confirmerEtape);
router.get('/etapes/semaine', isAuthenticated, authorize('read', 'Etape'), retardCtrl.getEtapesDeLaSemaine);

module.exports = router;


