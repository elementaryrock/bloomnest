const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
    generateNarrative,
    getNarrativeHistory,
    getNarrativeById
} = require('../controllers/narrativeController');

// All routes require authentication
router.use(authenticate);

// POST /api/narrative/generate - Generate a new storybook
router.post('/generate', generateNarrative);

// GET /api/narrative/history - Get user's narrative history
router.get('/history', getNarrativeHistory);

// GET /api/narrative/:id - Get a specific narrative
router.get('/:id', getNarrativeById);

module.exports = router;
