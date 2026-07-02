const ratingService = require('../services/ratingService');

// ============================================================
// Rating Controller — Đánh giá truyện
// ============================================================

exports.getRatingByStory = async (req, res, next) => {
    try {
        const stats = await ratingService.getRatingByStory(req.params.storyId);
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

exports.rateStory = async (req, res, next) => {
    try {
        const result = await ratingService.rateStory(
            req.user.id,
            req.body.storyId,
            req.body.score
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
};
