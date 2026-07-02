const Chapter = require('../models/Chapter');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Get all chapters of a specific story
exports.getChaptersByStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const chapters = await Chapter.find({ storyId }).sort({ chapterNumber: 1 }).lean();

    res.json(chapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get chapter content (images) with VIP check
exports.getChapterContent = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findById(id).populate('storyId', 'title thumbnail').lean();

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    // Since we populated storyId, we need its actual ID for latest chapter check
    const actualStoryId = chapter.storyId._id || chapter.storyId;

    // Increment the view count for the story when a chapter is read
    const Story = require('../models/Story');
    await Story.findByIdAndUpdate(actualStoryId, { $inc: { views: 1 } });

    const isVipRequired = chapter.isVip; // ONLY requires VIP if flagged explicitly

    // Check if the chapter requires VIP access
    if (isVipRequired) {
      // Get token from Auth header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          message: 'Token required to read this VIP chapter',
          requiresVip: true
        });
      }

      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        // Verify user in DB to ensure latest VIP status
        const user = await User.findById(decoded.id);

        if (!user || user.isVip !== true) {
          return res.status(403).json({
            message: 'You must be a VIP member to read this chapter',
            requiresVip: true
          });
        }
      } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token', requiresVip: true });
      }
    }

    res.json({
      _id: chapter._id,
      storyId: actualStoryId,
      story: chapter.storyId, // Has { _id, title, thumbnail } due to populate
      chapterNumber: chapter.chapterNumber,
      title: chapter.chapterTitle || "Chapter " + chapter.chapterNumber,
      content: chapter.image
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new chapter
exports.createChapter = async (req, res) => {
  try {
    const { storyId, chapterNumber, chapterTitle, image, isVip } = req.body;
    
    // check max chapter number
    const existingNum = await Chapter.findOne({ storyId, chapterNumber });
    if (existingNum) {
      return res.status(400).json({ message: 'Chapter number already exists' });
    }

    const chapter = new Chapter({ storyId, chapterNumber, chapterTitle, image, isVip });
    await chapter.save();
    
    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a chapter
exports.updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapterNumber, chapterTitle, image, isVip } = req.body;
    
    const chapter = await Chapter.findByIdAndUpdate(id, { chapterNumber, chapterTitle, image, isVip }, { new: true });
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a chapter
exports.deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findByIdAndDelete(id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    res.json({ message: 'Chapter deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

