const express = require('express');
const router = express.Router();
const partyController = require('../controllers/partyController');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/permissionMiddleware');

router.use(authMiddleware);
router.use(requirePermission('parties'));

router.get('/', partyController.getParties);
router.get('/:id', partyController.getPartyById);
router.get('/:id/bills', partyController.getPartyBills);
router.post('/', partyController.createParty);
router.put('/:id', partyController.updateParty);
router.delete('/:id', partyController.deleteParty);

module.exports = router;
