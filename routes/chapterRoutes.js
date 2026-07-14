const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');
const { auth, optionalAuth } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { createChapterRules, updateChapterRules } = require('../middlewares/validators/chapterValidator');

// Public
router.get('/story/:storyId', chapterController.getChaptersByStory);
router.get('/:id', optionalAuth, chapterController.getChapterContent); // Có optionalAuth để kiểm tra VIP

// Admin
router.get('/admin/story/:storyId/hidden', auth, authorize('admin'), chapterController.getHiddenChaptersByStory);
router.post('/', auth, authorize('admin'), validate(createChapterRules), chapterController.createChapter);
router.put('/:id', auth, authorize('admin'), validate(updateChapterRules), chapterController.updateChapter);
router.delete('/:id', auth, authorize('admin'), chapterController.deleteChapter);
router.post('/:id/restore', auth, authorize('admin'), chapterController.restoreChapter);

module.exports = router;
