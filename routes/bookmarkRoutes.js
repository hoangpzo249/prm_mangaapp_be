const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');

router.get('/', bookmarkController.getBookmarks);
router.get('/check/:storyId', bookmarkController.checkBookmark);
router.post('/toggle', bookmarkController.toggleBookmark);

module.exports = router;