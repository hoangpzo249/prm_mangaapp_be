const chapterService = require('../services/chapterService');

// ============================================================
// Chapter Controller — API chapter
// ============================================================

exports.getChaptersByStory = async (req, res, next) => {
    try {
        const chapters = await chapterService.getChaptersByStory(req.params.storyId);
        res.json(chapters);
    } catch (error) {
        next(error);
    }
};

exports.getChapterContent = async (req, res, next) => {
    try {
        // userId có thể null nếu chưa đăng nhập (optionalAuth)
        const userId = req.user ? req.user.id : null;
        const chapter = await chapterService.getChapterContent(req.params.id, userId);
        res.json(chapter);
    } catch (error) {
        next(error);
    }
};

exports.createChapter = async (req, res, next) => {
    try {
        const chapter = await chapterService.createChapter(req.body);
        res.status(201).json(chapter);
    } catch (error) {
        next(error);
    }
};

exports.updateChapter = async (req, res, next) => {
    try {
        const chapter = await chapterService.updateChapter(req.params.id, req.body);
        res.json(chapter);
    } catch (error) {
        next(error);
    }
};

exports.deleteChapter = async (req, res, next) => {
    try {
        const result = await chapterService.deleteChapter(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.restoreChapter = async (req, res, next) => {
    try {
        const result = await chapterService.restoreChapter(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.getHiddenChaptersByStory = async (req, res, next) => {
    try {
        const chapters = await chapterService.getHiddenChaptersByStory(req.params.storyId);
        res.json(chapters);
    } catch (error) {
        next(error);
    }
};
