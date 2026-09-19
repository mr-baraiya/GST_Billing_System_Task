const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/permissionMiddleware');

router.use(authMiddleware);
router.use(requirePermission('dashboard'));

router.get('/', dashboardController.getDashboard);

module.exports = router;
