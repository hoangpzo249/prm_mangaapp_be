const commentService = require('../services/commentService');

// ============================================================
// Comment Controller — Bình luận
// ============================================================

exports.getCommentsByStory = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const comments = await commentService.getCommentsByStory(req.params.storyId, page, limit);
        res.json(comments);
    } catch (error) {
        next(error);
    }
};

exports.createComment = async (req, res, next) => {
    try {
        const comment = await commentService.createComment(req.user.id, req.body);
        res.status(201).json(comment);
    } catch (error) {
        next(error);
    }
};

exports.deleteComment = async (req, res, next) => {
    try {
        const result = await commentService.deleteComment(req.params.id, req.user.id, req.user.role);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
