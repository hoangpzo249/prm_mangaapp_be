const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');

router.get('/story/:storyId', chapterController.getChaptersByStory);
router.get('/:id', chapterController.getChapterContent);

router.post('/', chapterController.createChapter);
router.put('/:id', chapterController.updateChapter);
router.delete('/:id', chapterController.deleteChapter);

module.exports = router;
