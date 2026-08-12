import { Message } from '../Model/Message.js';
import { User } from '../Model/User.js';
import { Notification } from '../Model/Notification.js';

// Send a direct message to a user (student -> teacher or teacher -> student)
export async function sendMessage(req, res) {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Receiver and content are required' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content: content.trim(),
    });

    // Create a notification for the receiver
    await Notification.create({
      user: receiverId,
      title: `New message from ${req.user.name}`,
      message: content.length > 50 ? `${content.substring(0, 47)}...` : content,
      type: 'message',
    });

    return res.status(200).json({ success: true, message });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
}

// Get message history with a specific user
export async function getChatHistory(req, res) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Fetch messages in either direction
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .sort({ createdAt: 1 })
    .lean();

    // Mark messages sent by the other user to me as read
    await Message.updateMany(
      { sender: userId, receiver: currentUserId, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({ success: true, count: messages.length, messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch chat history', error: error.message });
  }
}

// Get active conversations list
export async function getConversations(req, res) {
  try {
    const currentUserId = req.user._id;

    // Find all messages involving the current user
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }]
    })
    .sort({ createdAt: -1 })
    .lean();

    const conversationMap = {};

    messages.forEach((msg) => {
      const otherUserId = msg.sender.toString() === currentUserId.toString()
        ? msg.receiver.toString()
        : msg.sender.toString();

      if (!conversationMap[otherUserId]) {
        conversationMap[otherUserId] = {
          lastMessage: msg,
          unreadCount: 0,
        };
      }

      // Count unread messages sent by the other user
      if (msg.receiver.toString() === currentUserId.toString() && !msg.isRead) {
        conversationMap[otherUserId].unreadCount += 1;
      }
    });

    const participantIds = Object.keys(conversationMap);
    const participants = await User.find({ _id: { $in: participantIds } })
      .select('name email role profile')
      .lean();

    const conversations = participants.map((p) => {
      const details = conversationMap[p._id.toString()];
      return {
        user: p,
        lastMessage: details.lastMessage,
        unreadCount: details.unreadCount,
      };
    });

    // Sort by latest message date descending
    conversations.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

    return res.status(200).json({ success: true, count: conversations.length, conversations });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch conversations', error: error.message });
  }
}

// Get online teachers (or simulate availability status)
export async function getOnlineTeachers(req, res) {
  try {
    // Fetch all users with role 'teacher'
    const teachers = await User.find({ role: 'teacher' })
      .select('name email role profile')
      .lean();

    // Dynamically simulate online status:
    // Teachers with index 0, 2, 4 etc. are marked online (like Dr. Sarah Jenkins, Marcus Vance).
    const onlineTeachers = teachers.map((teacher, index) => {
      return {
        ...teacher,
        isOnline: index % 2 === 0, // Simulated online status
      };
    });

    return res.status(200).json({ success: true, count: onlineTeachers.length, teachers: onlineTeachers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch online teachers', error: error.message });
  }
}

// Get enrolled students list
export async function getEnrolledStudents(req, res) {
  try {
    const students = await User.find({ role: 'student' })
      .select('name email role profile')
      .lean();
    return res.status(200).json({ success: true, count: students.length, students });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch students', error: error.message });
  }
}
