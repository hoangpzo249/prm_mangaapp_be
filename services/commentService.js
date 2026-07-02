const commentRepo = require('../repositories/commentRepository');
const AppError = require('../utils/AppError');

// ============================================================
// Comment Service — Bình luận truyện
// ============================================================

/** Lấy comments của truyện (có phân trang) */
exports.getCommentsByStory = async (storyId, page, limit) => {
    const comments = await commentRepo.findByStoryId(storyId, page, limit);

    // Gắn replies cho mỗi comment gốc
    const withReplies = await Promise.all(
        comments.map(async (comment) => {
            const replies = await commentRepo.findReplies(comment._id);
            return { ...comment, replies };
        })
    );

    return withReplies;
};

/** Tạo comment mới */
exports.createComment = async (userId, data) => {
    return commentRepo.create({
        userId,
        storyId: data.storyId,
        chapterId: data.chapterId || null,
        content: data.content,
        parentId: data.parentId || null
    });
};

/** Xóa comment (chỉ owner hoặc admin) */
exports.deleteComment = async (commentId, userId, userRole) => {
    const comment = await commentRepo.findById(commentId);
    if (!comment) throw new AppError('Comment không tồn tại', 404);

    // Chỉ chủ comment hoặc admin mới được xóa
    if (comment.userId.toString() !== userId && userRole !== 'admin') {
        throw new AppError('Bạn không có quyền xóa comment này', 403);
    }

    // Xóa replies trước
    await commentRepo.deleteReplies(commentId);
    await commentRepo.delete(commentId);

    return { message: 'Xóa comment thành công' };
};
