const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
  try {
    // Only fetch the last 50 messages to prevent heavy load
    const messages = await Message.find()
      .populate('sender', 'parentName childName photoUrl')
      .sort({ createdAt: -1 })
      .limit(50);
      
    // Reverse so the oldest of the 50 is first
    return res.status(200).json({
      success: true,
      data: messages.reverse()
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_HISTORY_ERROR',
        message: 'Could not fetch chat history'
      }
    });
  }
};
