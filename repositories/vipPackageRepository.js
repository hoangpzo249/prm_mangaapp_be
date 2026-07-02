const VipPackage = require('../models/VipPackage');

// ============================================================
// VipPackage Repository — Data access layer cho VipPackage
// ============================================================

/** Lấy tất cả gói đang active (hiển thị cho user) */
exports.findActive = () => {
    return VipPackage.find({ isActive: true }).sort({ priceCoins: 1 }).lean();
};

/** Lấy tất cả gói (admin quản lý) */
exports.findAll = () => {
    return VipPackage.find().sort({ createdAt: -1 }).lean();
};

exports.findById = (id) => {
    return VipPackage.findById(id);
};

exports.create = (data) => {
    const pkg = new VipPackage(data);
    return pkg.save();
};

exports.update = (id, data) => {
    return VipPackage.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.delete = (id) => {
    return VipPackage.findByIdAndDelete(id);
};
