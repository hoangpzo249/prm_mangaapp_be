const storyService = require('../services/storyService');

// ============================================================
// Story Controller — API truyện
// ============================================================

exports.getStories = async (req, res, next) => {
    try {
        const stories = await storyService.getAllStories();
        res.json(stories);
    } catch (error) {
        next(error);
    }
};

exports.getHotStories = async (req, res, next) => {
    try {
        const stories = await storyService.getHotStories();
        res.json(stories);
    } catch (error) {
        next(error);
    }
};

exports.getRandomStories = async (req, res, next) => {
    try {
        const stories = await storyService.getRandomStories();
        res.json(stories);
    } catch (error) {
        next(error);
    }
};

exports.getRecentUpdates = async (req, res, next) => {
    try {
        const stories = await storyService.getRecentUpdates();
        res.json(stories);
    } catch (error) {
        next(error);
    }
};

exports.searchStories = async (req, res, next) => {
    try {
        const stories = await storyService.searchStories(req.query.keyword);
        res.json(stories);
    } catch (error) {
        next(error);
    }
};

exports.getStoryById = async (req, res, next) => {
    try {
        const story = await storyService.getStoryById(req.params.id);
        res.json(story);
    } catch (error) {
        next(error);
    }
};

exports.createStory = async (req, res, next) => {
    try {
        const story = await storyService.createStory(req.body);
        res.status(201).json(story);
    } catch (error) {
        next(error);
    }
};

exports.updateStory = async (req, res, next) => {
    try {
        const story = await storyService.updateStory(req.params.id, req.body);
        res.json(story);
    } catch (error) {
        next(error);
    }
};

exports.deleteStory = async (req, res, next) => {
    try {
        const result = await storyService.deleteStory(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
