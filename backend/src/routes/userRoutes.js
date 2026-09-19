const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/permissionMiddleware');

// All staff management routes require JWT auth AND manage_staff permission
router.use(authMiddleware);
router.use(requirePermission('manage_staff'));

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.put('/:id/toggle-status', userController.toggleUserStatus);

module.exports = router;
