const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/permissionMiddleware');

router.use(authMiddleware);

router.get('/', shopController.getShopSettings);
router.put('/', requirePermission('shop_settings'), shopController.updateShopSettings);

module.exports = router;
