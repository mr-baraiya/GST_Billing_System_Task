const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/permissionMiddleware');

router.use(authMiddleware);
router.use(requirePermission('items'));

router.get('/', itemController.getItems);
router.post('/', itemController.createItem);
router.put('/:id', itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

module.exports = router;
