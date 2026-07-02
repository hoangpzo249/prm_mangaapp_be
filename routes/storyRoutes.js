const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { auth } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { createStoryRules, updateStoryRules } = require('../middlewares/validators/storyValidator');

// Public
router.get('/', storyController.getStories);
router.get('/hot', storyController.getHotStories);
router.get('/random', storyController.getRandomStories);
router.get('/recent', storyController.getRecentUpdates);
router.get('/search', storyController.searchStories);
router.get('/:id', storyController.getStoryById);

// Admin
router.post('/', auth, authorize('admin'), validate(createStoryRules), storyController.createStory);
router.put('/:id', auth, authorize('admin'), validate(updateStoryRules), storyController.updateStory);
router.delete('/:id', auth, authorize('admin'), storyController.deleteStory);

module.exports = router;
