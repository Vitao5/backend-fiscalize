const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/middleware');
const {
    listConnectors,
    createConnectToken,
    saveItem,
    listItems,
    deleteItem,
    getAccounts,
    getTransactions,
    importTransactions,
    completeOnboarding,
    getOnboardingStatus,
    getDashboardData,
    syncData
} = require('../controllers/pluggyController');

// Todas as rotas protegidas por auth
router.get('/connectors', authMiddleware, listConnectors);
router.get('/onboarding-status', authMiddleware, getOnboardingStatus);
router.get('/dashboard-data', authMiddleware, getDashboardData);
router.post('/sync', authMiddleware, syncData);
router.post('/connect-token', authMiddleware, createConnectToken);
router.post('/items', authMiddleware, saveItem);
router.get('/items', authMiddleware, listItems);
router.delete('/items/:id', authMiddleware, deleteItem);
router.get('/accounts/:itemId', authMiddleware, getAccounts);
router.get('/transactions/:accountId', authMiddleware, getTransactions);
router.post('/import-transactions', authMiddleware, importTransactions);
router.post('/complete-onboarding', authMiddleware, completeOnboarding);

module.exports = router;
