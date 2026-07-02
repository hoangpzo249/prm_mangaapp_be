const userService = require('../services/userService');

// ============================================================
// User Controller — Quản lý user (getMe + Admin CRUD)
// ============================================================

exports.getMe = async (req, res, next) => {
    try {
        const user = await userService.getMe(req.user.id);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
};

exports.adminCreateUser = async (req, res, next) => {
    try {
        const user = await userService.adminCreateUser(req.body);
        res.status(201).json({ message: 'Tạo user thành công', user });
    } catch (error) {
        next(error);
    }
};

exports.adminUpdateUser = async (req, res, next) => {
    try {
        const user = await userService.adminUpdateUser(req.params.id, req.body);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

exports.adminDeleteUser = async (req, res, next) => {
    try {
        const result = await userService.adminDeleteUser(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
