const Comment = require('../models/Comment');

// ============================================================
// Comment Repository — Data access layer cho Comment
// ============================================================

/** Lấy comments của truyện, phân trang, populate user */
exports.findByStoryId = (storyId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    return Comment.find({ storyId, parentId: null }) // Chỉ lấy comment gốc
        .populate('userId', 'username fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};

/** Lấy replies của một comment */
exports.findReplies = (parentId) => {
    return Comment.find({ parentId })
        .populate('userId', 'username fullName')
        .sort({ createdAt: 1 })
        .lean();
};

exports.findById = (id) => {
    return Comment.findById(id);
};

exports.create = (data) => {
    const comment = new Comment(data);
    return comment.save();
};

exports.delete = (id) => {
    return Comment.findByIdAndDelete(id);
};

/** Xóa tất cả replies khi xóa comment cha */
exports.deleteReplies = (parentId) => {
    return Comment.deleteMany({ parentId });
};
