const express = require('express');
const router = express.Router();
const StatistiqueCtrl = require('../controllers/statistique');
const isAuthenticated = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');

// Route statistiques - lecture seulement
router.get('/getStatistiques', isAuthenticated, authorize('read', 'Statistique'), StatistiqueCtrl.getStatistiques);

module.exports = router;


