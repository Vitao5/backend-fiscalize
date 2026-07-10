const express = require("express");
const { authMiddleware, checkHeadersSent } = require("../middleware/middleware");
const {
    registerInstallmentPurchase,
    listInstallmentPurchases,
    updateInstallmentPurchase,
    deleteInstallmentPurchase,
    getInstallmentPurchaseById,
    deleteIndividualInstallment
} = require('../controllers/installmentPurchaseController')

const router = express.Router();

router.post('/register', authMiddleware, checkHeadersSent, registerInstallmentPurchase)
router.post('/update', authMiddleware, checkHeadersSent, updateInstallmentPurchase)
router.post('/list', authMiddleware, checkHeadersSent, listInstallmentPurchases)
router.post('/delete', authMiddleware, checkHeadersSent, deleteInstallmentPurchase)
router.post('/delete-installment', authMiddleware, checkHeadersSent, deleteIndividualInstallment)
router.get('/:id', authMiddleware, checkHeadersSent, getInstallmentPurchaseById)

module.exports = router;
