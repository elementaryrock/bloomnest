const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authenticate = require('../middleware/auth');

router.get('/messages', authenticate, chatController.getMessages);

module.exports = router;
