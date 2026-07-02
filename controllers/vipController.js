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
