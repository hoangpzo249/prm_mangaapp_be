const historyService = require('../services/historyService');

// ============================================================
// History Controller — Lịch sử đọc
// ============================================================

exports.getHistory = async (req, res, next) => {
    try {
        const history = await historyService.getHistory(req.user.id);
        res.json(history);
    } catch (error) {
        next(error);
    }
};

exports.getHistoryByStory = async (req, res, next) => {
    try {
        const item = await historyService.getHistoryForStory(
            req.user.id,
            req.params.storyId
        );
        res.json(item);
    } catch (error) {
        next(error);
    }
};

exports.saveHistory = async (req, res, next) => {
    try {
        const result = await historyService.saveHistory(
            req.user.id,
            req.body.storyId,
            req.body.chapterId
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.deleteHistory = async (req, res, next) => {
    try {
        const result = await historyService.deleteHistory(req.user.id, req.params.storyId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};