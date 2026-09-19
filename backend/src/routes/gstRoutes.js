const express = require('express');
const router = express.Router();
const gstRateController = require('../controllers/gstRateController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', gstRateController.getAllGstRates);
router.post('/', gstRateController.createGstRate);
router.delete('/:id', gstRateController.deleteGstRate);

module.exports = router;
