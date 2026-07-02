const bookmarkService = require('../services/bookmarkService');

// ============================================================
// Bookmark Controller — Tủ truyện
// ============================================================

exports.getBookmarks = async (req, res, next) => {
    try {
        const bookmarks = await bookmarkService.getBookmarks(req.user.id);
        res.json(bookmarks);
    } catch (error) {
        next(error);
    }
};

exports.checkBookmark = async (req, res, next) => {
    try {
        const result = await bookmarkService.checkBookmark(req.user.id, req.params.storyId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.toggleBookmark = async (req, res, next) => {
    try {
        const result = await bookmarkService.toggleBookmark(req.user.id, req.body.storyId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};