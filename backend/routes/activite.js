const express = require('express');
const router = express.Router();
const ActivitéCtrl = require('../controllers/activite');
const upload = require('../upload');
const isAuthenticated = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');

router.patch('/associerUtilisateur/:id', isAuthenticated, authorize('update', 'Activite'), ActivitéCtrl.associerUtilisateur);
router.get('/getActivitiesAll', isAuthenticated, authorize('read', 'Activite'), ActivitéCtrl.getActivitiesAll);
router.get('/getActivities', isAuthenticated, authorize('read', 'Activite'), ActivitéCtrl.getActivities);
router.delete('/deleteActivity/:id', isAuthenticated, authorize('delete', 'Activite'), ActivitéCtrl.deleteActivity);
router.get('/statActivities', isAuthenticated, authorize('read', 'Activite'), ActivitéCtrl.statActivities);
router.post('/createActivity', isAuthenticated, authorize('create', 'Activite'), ActivitéCtrl.createActivity);
router.post('/importFile', upload.single('excelFile'), isAuthenticated, authorize('create', 'Activite'), ActivitéCtrl.importFile);
router.put('/updateActivity/:_id', isAuthenticated, authorize('update', 'Activite'), ActivitéCtrl.updateActivity);
router.get('/activites-en-retard', isAuthenticated, authorize('read', 'Activite'), ActivitéCtrl.nbActivitesEnRetardParEtape);
router.get('/getActivityById/:_id', isAuthenticated, authorize('read', 'Activite'), ActivitéCtrl.getActivityById);

module.exports = router;


