const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createCommentRules } = require('../middlewares/validators/commentValidator');

router.get('/story/:storyId', commentController.getCommentsByStory);
router.post('/', auth, validate(createCommentRules), commentController.createComment);
router.delete('/:id', auth, commentController.deleteComment);

module.exports = router;
