const History = require('../models/History');
const jwt = require('jsonwebtoken');

const getUserIdFromAuth = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authorization token required');
  }
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
  return decoded.id;
};

exports.getHistory = async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    const history = await History.find({ userId })
      .populate('storyId', 'title thumbnail views slug')
      .populate('lastChapterId', 'chapterNumber title chapterTitle')
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();

    res.json(history);
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.message === 'Authorization token required') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.saveHistory = async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    const { storyId, chapterId } = req.body;

    if (!storyId || !chapterId) {
      return res.status(400).json({ message: 'storyId and chapterId are required' });
    }

    let historyRecord = await History.findOne({ userId, storyId });
    if (historyRecord) {
       historyRecord.lastChapterId = chapterId;
       historyRecord.updatedAt = Date.now();
       await historyRecord.save();
    } else {
       historyRecord = new History({ userId, storyId, lastChapterId: chapterId });
       await historyRecord.save();
    }

    res.json({ message: 'History saved successfully', history: historyRecord });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.message === 'Authorization token required') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteHistory = async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    const { storyId } = req.params;

    if (!storyId) {
      return res.status(400).json({ message: 'storyId is required' });
    }

    await History.findOneAndDelete({ userId, storyId });
    res.json({ message: 'History deleted successfully' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.message === 'Authorization token required') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    res.status(500).json({ error: error.message });
  }
};