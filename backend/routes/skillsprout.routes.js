const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
    getGardenByPatient,
    getForestByPatient,
    createGoal,
    completeActivity,
    waterPlant,
    getGrowthLogs,
    getAnalytics,
    deleteGoal,
    updateParentGoal,
    deleteParentGoal
} = require('../controllers/skillSproutController');

// All routes require authentication
router.use(authenticate);

// ── Garden & Forest Views ──────────────────────────────────
// GET /api/skillsprout/garden/:patientId
router.get('/garden/:patientId', getGardenByPatient);

// GET /api/skillsprout/forest/:patientId
router.get('/forest/:patientId', getForestByPatient);

// ── Goal Management ────────────────────────────────────────
// POST /api/skillsprout/goals
router.post('/goals', createGoal);

// DELETE /api/skillsprout/goals/:goalId
router.delete('/goals/:goalId', deleteGoal);

// ── Activity & Watering ────────────────────────────────────
// POST /api/skillsprout/goals/:goalId/complete
router.post('/goals/:goalId/complete', completeActivity);

// POST /api/skillsprout/goals/:goalId/water
router.post('/goals/:goalId/water', waterPlant);

// ── Analytics & Logs ───────────────────────────────────────
// GET /api/skillsprout/logs/:patientId
router.get('/logs/:patientId', getGrowthLogs);

// GET /api/skillsprout/analytics/:patientId
router.get('/analytics/:patientId', getAnalytics);

// ── Parent Goal Management (separate path → zero impact on therapist routes) ──
// PUT  /api/skillsprout/parent-goals/:goalId  (parents edit their own goals)
router.put('/parent-goals/:goalId', updateParentGoal);

// DELETE /api/skillsprout/parent-goals/:goalId  (parents delete their own goals)
router.delete('/parent-goals/:goalId', deleteParentGoal);

module.exports = router;
