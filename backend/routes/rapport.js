const express = require('express');
const router = express.Router();
const RapportCtrl = require('../controllers/rapport');
const isAuthenticated = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');

router.get('/statistiques/periode', isAuthenticated, authorize('read', 'Rapport'), RapportCtrl.getStatistiquesParPeriode);

module.exports = router;


