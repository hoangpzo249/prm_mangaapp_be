const statsService = require('../services/statsService');

exports.getOverview = async (req, res, next) => {
    try {
        const stats = await statsService.getOverview();
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

exports.getTopStories = async (req, res, next) => {
    try {
        const topStories = await statsService.getTopStories();
        res.json(topStories);
    } catch (error) {
        next(error);
    }
};

exports.getRevenueChart = async (req, res, next) => {
    try {
        const chartData = await statsService.getRevenueChart();
        res.json(chartData);
    } catch (error) {
        next(error);
    }
};

exports.getUserGrowthChart = async (req, res, next) => {
    try {
        const chartData = await statsService.getUserGrowthChart();
        res.json(chartData);
    } catch (error) {
        next(error);
    }
};
