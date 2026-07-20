const authService = require('../services/authService');



exports.sendRegisterOtp = async (req, res, next) => {
    try {
        const result = await authService.sendRegisterOtp(req.body.email);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const result = await authService.forgotPassword(req.body.email);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const result = await authService.resetPassword(req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const result = await authService.changePassword(req.user.id, req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
