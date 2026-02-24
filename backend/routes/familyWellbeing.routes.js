const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const {
    logWellbeing,
    getWellbeingHistory,
    getRippleAnalysis
} = require('../controllers/familyWellbeingController');

// All routes require parent authentication
router.use(authenticate);
router.use(checkRole('parent'));

// POST /api/family-wellbeing/log - Log weekly stress & sibling feelings
router.post('/log', logWellbeing);

// GET /api/family-wellbeing/history - Get all wellbeing logs
router.get('/history', getWellbeingHistory);

// GET /api/family-wellbeing/ripple-analysis - Get AI correlation analysis
router.get('/ripple-analysis', getRippleAnalysis);

module.exports = router;
