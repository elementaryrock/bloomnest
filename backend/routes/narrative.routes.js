const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
    generateNarrative,
    getNarrativeHistory,
    getNarrativeById,
    togglePinNarrative,
    deleteNarrative
} = require('../controllers/narrativeController');

// All routes require authentication
router.use(authenticate);

// POST /api/narrative/generate - Generate a new storybook
router.post('/generate', generateNarrative);

// GET /api/narrative/history - Get user's narrative history
router.get('/history', getNarrativeHistory);

// GET /api/narrative/:id - Get a specific narrative
router.get('/:id', getNarrativeById);

// PUT /api/narrative/:id/pin - Toggle pin status
router.put('/:id/pin', togglePinNarrative);

// DELETE /api/narrative/:id - Delete a specific narrative
router.delete('/:id', deleteNarrative);

module.exports = router;
