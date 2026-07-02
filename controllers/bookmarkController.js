const Bookmark = require('../models/Bookmark');
const Chapter = require('../models/Chapter');
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

// Lấy danh sách truyện đã lưu của một user
exports.getBookmarks = async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    const bookmarks = await Bookmark.find({ userId })
      .populate({
        path: 'storyId',
        select: 'title thumbnail views status slug'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Map lại format để trả về cho FE dễ dùng, và lấy latestChapter
    const formattedBookmarks = await Promise.all(bookmarks.map(async (b) => {
      let latestChapter = null;
      if (b.storyId && b.storyId._id) {
        latestChapter = await Chapter.findOne({ storyId: b.storyId._id })
          .sort({ chapterNumber: -1 })
          .select('_id chapterNumber title chapterTitle')
          .lean();
      }

      return {
        _id: b._id,
        story: {
          ...b.storyId,
          latestChapter
        },
        bookmarkedAt: b.createdAt
      };
    }));

    res.json(formattedBookmarks);
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.message === 'Authorization token required') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Check xem user đã lưu truyện này chưa
exports.checkBookmark = async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    const { storyId } = req.params;

    const bookmark = await Bookmark.findOne({ userId, storyId });
    res.json({ isBookmarked: !!bookmark });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.message === 'Authorization token required') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Toggle: Thêm vào hoặc xoá khỏi tủ truyện
exports.toggleBookmark = async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    const { storyId } = req.body;

    if (!storyId) {
      return res.status(400).json({ message: 'storyId is required' });
    }

    const existingBookmark = await Bookmark.findOne({ userId, storyId });

    if (existingBookmark) {
      // Đã có -> Xoá
      await Bookmark.findByIdAndDelete(existingBookmark._id);
      return res.json({ isBookmarked: false, message: 'Removed from library' });
    } else {
      // Chưa có -> Thêm
      const newBookmark = new Bookmark({ userId, storyId });
      await newBookmark.save();
      return res.json({ isBookmarked: true, message: 'Added to library' });
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.message === 'Authorization token required') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    res.status(500).json({ error: error.message });
  }
};