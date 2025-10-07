const express = require('express');
const router = express.Router();
const deleteCtrl = require('../controllers/delete');
const isAuthenticated = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');

router.delete('/delete', isAuthenticated, authorize('manage', 'all'), deleteCtrl.deleteCollections);

module.exports = router;


