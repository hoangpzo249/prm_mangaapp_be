const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { toggleBookmarkRules } = require('../middlewares/validators/bookmarkValidator');

router.use(auth); // Tất cả route đều cần login

router.get('/', bookmarkController.getBookmarks);
router.get('/check/:storyId', bookmarkController.checkBookmark);
router.post('/toggle', validate(toggleBookmarkRules), bookmarkController.toggleBookmark);

module.exports = router;