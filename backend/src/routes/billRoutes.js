const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const authMiddleware = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/permissionMiddleware');

router.use(authMiddleware);

router.get('/', requirePermission('bills_history'), billController.getBills);
router.get('/export/csv', requirePermission('reports'), billController.exportBillsCsv);
router.get('/:id', requirePermission('bills_history'), billController.getBillById);
router.get('/:id/pdf', requirePermission('bills_history'), billController.downloadBillPdf);
router.post('/', requirePermission('create_bill'), billController.createBill);
router.post('/:id/send-email', billController.sendBillEmail);
router.patch('/:id/status', requirePermission('create_bill'), billController.updateBillStatus);

module.exports = router;
