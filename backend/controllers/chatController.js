const Message = require('../models/Message');
const DirectMessage = require('../models/DirectMessage');
const Booking = require('../models/Booking');
const Patient = require('../models/Patient');

/**
 * GET /api/chat/messages
 * Fetch last 50 messages from the global room (backward compat).
 */
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('sender', 'parentName childName photoUrl')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      data: messages.reverse()
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'CHAT_HISTORY_ERROR', message: 'Could not fetch chat history' }
    });
  }
};

/**
 * GET /api/chat/messages/:room
 * Fetch last 50 messages for a specific therapy-based room.
 */
exports.getRoomMessages = async (req, res) => {
  try {
    const { room } = req.params;
    const validRooms = ['general', 'speech', 'ot', 'pt', 'psychology', 'ei'];

    if (!validRooms.includes(room)) {
      return res.status(400).json({
        success: false,
        error: { message: `Invalid room. Must be one of: ${validRooms.join(', ')}` }
      });
    }

    const messages = await Message.find({ room })
      .populate('sender', 'parentName childName photoUrl diagnosis')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      data: messages.reverse()
    });
  } catch (error) {
    console.error('Error fetching room messages:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'ROOM_HISTORY_ERROR', message: 'Could not fetch room messages' }
    });
  }
};

/**
 * GET /api/chat/parent-matches
 * Find other parents whose children attend the same therapy types.
 * Returns parentPhone so the frontend can build WhatsApp links.
 */
exports.getParentMatches = async (req, res) => {
  try {
    const userId = req.user.userId;
    const specialId = req.user.specialId;

    // 1) Find the current patient's bookings to get their therapy types
    const myBookings = await Booking.find({ specialId }).select('therapyType');
    const myTherapyTypes = [...new Set(myBookings.map(b => b.therapyType))];

    // 2) Find the current patient record for diagnosis info
    const myPatient = await Patient.findOne({ specialId });

    // 3) Find other patients who have bookings with the same therapy types
    let matchedSpecialIds = [];
    if (myTherapyTypes.length > 0) {
      const matchedBookings = await Booking.find({
        therapyType: { $in: myTherapyTypes },
        specialId: { $ne: specialId }
      }).select('specialId therapyType');

      const specialIdMap = {};
      matchedBookings.forEach(b => {
        if (!specialIdMap[b.specialId]) {
          specialIdMap[b.specialId] = new Set();
        }
        specialIdMap[b.specialId].add(b.therapyType);
      });

      matchedSpecialIds = Object.entries(specialIdMap).map(([sid, types]) => ({
        specialId: sid,
        sharedTherapyTypes: [...types]
      }));
    }

    // 4) Get patient details for matched parents — include parentPhone for WhatsApp
    const matchedPatients = await Patient.find({
      specialId: { $in: matchedSpecialIds.map(m => m.specialId) },
      isActive: true
    }).select('specialId parentName childName diagnosis age gender photoUrl parentPhone');

    // 5) Combine patient info with shared therapy types
    const results = matchedPatients.map(patient => {
      const matchInfo = matchedSpecialIds.find(m => m.specialId === patient.specialId);
      const sharedDiagnosis = myPatient?.diagnosis?.filter(d =>
        patient.diagnosis?.includes(d)
      ) || [];

      return {
        _id: patient._id,
        parentName: patient.parentName,
        childName: patient.childName,
        childAge: patient.age,
        childGender: patient.gender,
        photoUrl: patient.photoUrl,
        parentPhone: patient.parentPhone || '',
        diagnosis: patient.diagnosis || [],
        sharedTherapyTypes: matchInfo?.sharedTherapyTypes || [],
        sharedDiagnosis,
        matchScore: (matchInfo?.sharedTherapyTypes?.length || 0) + (sharedDiagnosis.length * 2)
      };
    });

    results.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      success: true,
      data: {
        matches: results.slice(0, 20),
        myTherapyTypes,
        myDiagnosis: myPatient?.diagnosis || []
      }
    });
  } catch (error) {
    console.error('Error finding parent matches:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'MATCH_ERROR', message: 'Could not find parent matches' }
    });
  }
};

/**
 * POST /api/chat/dm/send
 * Send a direct message to another parent.
 * Body: { receiverId, content }
 */
exports.sendDirectMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.userId;

    if (!receiverId || !content?.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'receiverId and content are required' }
      });
    }

    if (receiverId === senderId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot send a message to yourself' }
      });
    }

    // Verify receiver exists
    const receiver = await Patient.findById(receiverId).select('parentName childName');
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: { message: 'Recipient not found' }
      });
    }

    const dm = new DirectMessage({
      sender: senderId,
      receiver: receiverId,
      content: content.trim()
    });
    await dm.save();

    // Populate sender info for the response
    const populated = await DirectMessage.findById(dm._id)
      .populate('sender', 'parentName childName photoUrl')
      .populate('receiver', 'parentName childName photoUrl');

    return res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    console.error('Error sending DM:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DM_SEND_ERROR', message: 'Could not send message' }
    });
  }
};

/**
 * GET /api/chat/dm/inbox
 * Get all DM conversations for the current user (latest message per conversation).
 */
exports.getInbox = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all messages where user is sender or receiver
    const messages = await DirectMessage.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender', 'parentName childName photoUrl')
      .populate('receiver', 'parentName childName photoUrl')
      .sort({ createdAt: -1 });

    // Group by conversation partner
    const conversations = {};
    messages.forEach(msg => {
      const partnerId = msg.sender._id.toString() === userId
        ? msg.receiver._id.toString()
        : msg.sender._id.toString();

      if (!conversations[partnerId]) {
        const partner = msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
        conversations[partnerId] = {
          partnerId,
          partnerName: partner.parentName,
          partnerChildName: partner.childName,
          partnerPhoto: partner.photoUrl,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
          isLastFromMe: msg.sender._id.toString() === userId
        };
      }

      // Count unread messages sent TO me
      if (msg.receiver._id.toString() === userId && !msg.read) {
        conversations[partnerId].unreadCount++;
      }
    });

    const inbox = Object.values(conversations).sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
    );

    return res.status(200).json({
      success: true,
      data: inbox
    });
  } catch (error) {
    console.error('Error fetching inbox:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INBOX_ERROR', message: 'Could not fetch inbox' }
    });
  }
};

/**
 * GET /api/chat/dm/conversation/:partnerId
 * Get full conversation with a specific parent.
 */
exports.getConversation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { partnerId } = req.params;

    const messages = await DirectMessage.find({
      $or: [
        { sender: userId, receiver: partnerId },
        { sender: partnerId, receiver: userId }
      ]
    })
      .populate('sender', 'parentName childName photoUrl')
      .populate('receiver', 'parentName childName photoUrl')
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark unread messages as read
    await DirectMessage.updateMany(
      { sender: partnerId, receiver: userId, read: false },
      { read: true }
    );

    return res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'CONVERSATION_ERROR', message: 'Could not fetch conversation' }
    });
  }
};

/**
 * GET /api/chat/dm/unread-count
 * Get total count of unread DMs for the current user.
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await DirectMessage.countDocuments({
      receiver: userId,
      read: false
    });

    return res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'UNREAD_ERROR', message: 'Could not fetch unread count' }
    });
  }
};
