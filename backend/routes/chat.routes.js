const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authenticate = require('../middleware/auth');

// All chat routes require authentication
router.use(authenticate);

// Community room messages
router.get('/messages', chatController.getMessages);
router.get('/messages/:room', chatController.getRoomMessages);

// Parent matching
router.get('/parent-matches', chatController.getParentMatches);

// Direct messages
router.post('/dm/send', chatController.sendDirectMessage);
router.get('/dm/inbox', chatController.getInbox);
router.get('/dm/conversation/:partnerId', chatController.getConversation);
router.get('/dm/unread-count', chatController.getUnreadCount);

module.exports = router;
