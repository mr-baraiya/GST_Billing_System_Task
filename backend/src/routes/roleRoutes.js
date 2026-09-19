const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/permissionMiddleware');

router.use(authMiddleware);

// GET /api/roles (Available to all logged in users)
router.get('/', roleController.getAllRoles);

// Management routes require manage_staff permission
router.post('/', requirePermission('manage_staff'), roleController.createRole);
router.put('/:id', requirePermission('manage_staff'), roleController.updateRole);
router.delete('/:id', requirePermission('manage_staff'), roleController.deleteRole);

module.exports = router;
