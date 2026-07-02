const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');

router.get('/', storyController.getStories);
router.get('/hot', storyController.getHotStories);
router.get('/random', storyController.getRandomStories);
router.get('/recent', storyController.getRecentUpdates); // Must be before /:id
router.get('/search', storyController.searchStories);
router.get('/:id', storyController.getStoryById);


router.post('/', storyController.createStory);
router.put('/:id', storyController.updateStory);
router.delete('/:id', storyController.deleteStory);

module.exports = router;

