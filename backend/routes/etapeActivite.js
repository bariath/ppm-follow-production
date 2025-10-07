const express = require('express');
const router = express.Router();
const etapeActiviteCtrl = require('../controllers/etapeActivite');
const isAuthenticated = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');

router.get('/filtrerActivitiesEnCours', isAuthenticated, authorize('read', 'EtapeActivite'), etapeActiviteCtrl.filtrerActivitiesEnCours);
router.get('/filtrerActivitiesTermine', isAuthenticated, authorize('read', 'EtapeActivite'), etapeActiviteCtrl.filtrerActivitiesTermine);
router.get('/filtrerActivitiesNonDemarer', isAuthenticated, authorize('read', 'EtapeActivite'), etapeActiviteCtrl.filtrerActivitiesNonDemarer);
router.get('/filtrerActivitiesAll', isAuthenticated, authorize('read', 'EtapeActivite'), etapeActiviteCtrl.filtrerActivitiesAll);
router.put('/ajouterDelaiReel', isAuthenticated, authorize('update', 'EtapeActivite'), etapeActiviteCtrl.ajouterDelaiReel);
router.get('/getEtapesByActivite/:id', isAuthenticated, authorize('read', 'EtapeActivite'), etapeActiviteCtrl.getEtapesByActivite);
router.get('/getActivitesAvecEtapes', isAuthenticated, authorize('read', 'EtapeActivite'), etapeActiviteCtrl.getActivitesAvecEtapes);
router.post('/associerActivitesSansEtapes', isAuthenticated, authorize('update', 'EtapeActivite'), etapeActiviteCtrl.associerActivitesSansEtapes);

module.exports = router;


