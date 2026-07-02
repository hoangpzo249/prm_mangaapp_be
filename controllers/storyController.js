const Story = require('../models/Story');
const Chapter = require('../models/Chapter');

// Get all stories
exports.getStories = async (req, res) => {
  try {
    const stories = await Story.find()
      .select('title thumbnail views slug')
      .lean();
      
    // Attach latest 1 chapter to each story
    const storiesWithChapters = await Promise.all(
      stories.map(async (story) => {
        const latestChapter = await Chapter.findOne({ storyId: story._id })
          .sort({ chapterNumber: -1 })
          .select('_id chapterNumber title chapterTitle')
          .lean();
        return { ...story, latestChapter };
      })
    );
      
    res.json(storiesWithChapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get recent updates
exports.getRecentUpdates = async (req, res) => {
  try {
    const stories = await Story.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    // Attach latest 3 chapters to each story
    const storiesWithChapters = await Promise.all(
      stories.map(async (story) => {
        const latestChapters = await Chapter.find({ storyId: story._id })
          .sort({ chapterNumber: -1 })
          .limit(3)
          .select('_id chapterNumber title chapterTitle updatedAt createdAt isVip')
          .lean();
        return { ...story, latestChapters };
      })
    );

    res.json(storiesWithChapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get hot stories (sorted by views)
exports.getHotStories = async (req, res) => {
  try {
    const stories = await Story.find()
      .sort({ views: -1 })
      .limit(5)
      .select('title thumbnail views slug description')
      .lean();
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search stories
exports.searchStories = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ message: 'Keyword is required for search' });
    }

    const stories = await Story.find({
      title: { $regex: keyword, $options: 'i' }
    }).lean();

    const storiesWithChapters = await Promise.all(
      stories.map(async (story) => {
        const latestChapter = await Chapter.findOne({ storyId: story._id })
          .sort({ chapterNumber: -1 })
          .select('_id chapterNumber title chapterTitle')
          .lean();
        return { ...story, latestChapter };
      })
    );

    res.json(storiesWithChapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single story by ID
exports.getStoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const story = await Story.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json(story);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get random stories for Featured Section
exports.getRandomStories = async (req, res) => {
  try {
    const stories = await Story.aggregate([
      { $sample: { size: 10 } },
      { $project: { _id: 1, title: 1, thumbnail: 1, views: 1, description: 1, genres: 1, status: 1 } }
    ]);
    
    const storiesWithChapters = await Promise.all(
      stories.map(async (story) => {
        const latestChapter = await Chapter.findOne({ storyId: story._id })
          .sort({ chapterNumber: -1 })
          .select('_id chapterNumber chapterTitle')
          .lean();
        return { ...story, latestChapter };
      })
    );
    
    res.json(storiesWithChapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Create a new story
exports.createStory = async (req, res) => {
  try {
    const { title, author, description, genres, thumbnail, status } = req.body;
    let slug = '';
    if (title) {
        slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    const newStory = new Story({
      title, author, description, genres, thumbnail, slug, status: status || 'Khoẻ'
    });
    const savedStory = await newStory.save();
    res.status(201).json(savedStory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing story
exports.updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (updateData.title) {
        updateData.slug = updateData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    const updatedStory = await Story.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedStory) return res.status(404).json({ message: 'Story not found' });
    res.json(updatedStory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a story
exports.deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    await Chapter.deleteMany({ storyId: id }); // Delete all chapters first
    const deletedStory = await Story.findByIdAndDelete(id);
    if (!deletedStory) return res.status(404).json({ message: 'Story not found' });
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
