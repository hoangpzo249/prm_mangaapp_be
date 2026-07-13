const vipService = require('../services/vipService');

// ============================================================
// VIP Controller — Quản lý VIP
// ============================================================

exports.getPackages = async (req, res, next) => {
    try {
        const packages = await vipService.getPackages();
        res.json(packages);
    } catch (error) {
        next(error);
    }
};

exports.buyVipPackage = async (req, res, next) => {
    try {
        const result = await vipService.buyVipPackage(req.user.id, req.body.packageId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.getMySubscriptions = async (req, res, next) => {
    try {
        const subs = await vipService.getMySubscriptions(req.user.id);
        res.json(subs);
    } catch (error) {
        next(error);
    }
};

// --- ADMIN METHODS ---
exports.getAllPackagesAdmin = async (req, res, next) => {
    try {
        const packages = await vipService.getAllPackagesAdmin();
        res.json(packages);
    } catch (error) {
        next(error);
    }
};

exports.createPackage = async (req, res, next) => {
    try {
        const result = await vipService.createPackage(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

exports.updatePackage = async (req, res, next) => {
    try {
        const result = await vipService.updatePackage(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.deletePackage = async (req, res, next) => {
    try {
        const result = await vipService.deletePackage(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
