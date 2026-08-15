const express = require("express");
const { authMiddleware, checkHeadersSent } = require("../middleware/middleware");
const { registerFixedPurchase, listFixedPurchase, alterFixedPurchase, deleteFixedPurchase } = require('../controllers/fixedPurchaseController');

const router = express.Router();

router.post('/register', authMiddleware, checkHeadersSent, registerFixedPurchase);
router.post('/list', authMiddleware, checkHeadersSent, listFixedPurchase);
router.post('/update', authMiddleware, checkHeadersSent, alterFixedPurchase);
router.post('/delete', authMiddleware, checkHeadersSent, deleteFixedPurchase);

module.exports = router;
