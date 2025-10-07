const express = require('express');
const router = express.Router();
const MappingCtrl = require('../controllers/mapping');
const isAuthenticated = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');

router.get('/mapping/fields', isAuthenticated, authorize('read', 'SaveMapping'), MappingCtrl.getMappingFields);
router.post('/mapping/save', isAuthenticated, authorize('create', 'SaveMapping'), MappingCtrl.getMappingSave);
router.get('/mapping', isAuthenticated, authorize('read', 'SaveMapping'), MappingCtrl.getMappings);
router.put('/mapping/update/:id', isAuthenticated, authorize('update', 'SaveMapping'), MappingCtrl.updateMapping);
router.delete('/mapping/delete/:id', isAuthenticated, authorize('delete', 'SaveMapping'), MappingCtrl.deleteMapping);

module.exports = router;


