const express = require('express');
const router = express.Router();
const etapeCtrl = require('../controllers/etape');
const upload = require('../upload');
const isAuthenticated = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');

router.post('/import', upload.single('excelFile'), isAuthenticated, authorize('create', 'Etape'), etapeCtrl.importStepsFromExcel);
router.post('/step/createStep', isAuthenticated, authorize('create', 'Etape'), etapeCtrl.createStep);
router.get('/step/getSteps', isAuthenticated, authorize('read', 'Etape'), etapeCtrl.getSteps);
router.get('/step/getAllSteps', isAuthenticated, authorize('read', 'Etape'), etapeCtrl.getAllSteps);
router.put('/step/updateStep/:id', isAuthenticated, authorize('update', 'Etape'), etapeCtrl.updateStep);
router.delete('/step/deleteStep/:id', isAuthenticated, authorize('delete', 'Etape'), etapeCtrl.deleteStep);

module.exports = router;


