const chapterRepo = require('../repositories/chapterRepository');
const storyRepo = require('../repositories/storyRepository');
const userRepo = require('../repositories/userRepository');
const refundService = require('./refundService');
const AppError = require('../utils/AppError');

// ============================================================
// Chapter Service — Business logic cho chapter
// ============================================================

/** Lấy danh sách chapters của truyện */
exports.getChaptersByStory = async (storyId) => {
    return chapterRepo.findByStoryId(storyId);
};

/** Lấy nội dung chapter (có VIP check) */
exports.getChapterContent = async (chapterId, userId) => {
    const chapter = await chapterRepo.findByIdWithStory(chapterId);
    if (!chapter) throw new AppError('Chapter không tồn tại', 404);

    // Tăng view cho story
    const actualStoryId = chapter.storyId._id || chapter.storyId;
    await storyRepo.incrementViews(actualStoryId);

    // Kiểm tra VIP
    if (chapter.isVip) {
        if (!userId) {
            throw new AppError('Cần đăng nhập để đọc chapter VIP', 401);
        }

        let user = await userRepo.findByIdWithPassword(userId);
        
        // Lazy load: Check và xoá VIP nếu hết hạn
        const userService = require('./userService');
        if (user) {
            user = await userService.checkAndClearExpiredVip(user);
        }

        if (!user || !user.isVip) {
            throw new AppError('Bạn cần là thành viên VIP để đọc chapter này', 403);
        }
    }

    return {
        _id: chapter._id,
        storyId: actualStoryId,
        story: chapter.storyId,
        chapterNumber: chapter.chapterNumber,
        title: chapter.chapterTitle || 'Chapter ' + chapter.chapterNumber,
        content: chapter.image
    };
};

/** Tạo chapter mới (Admin) */
exports.createChapter = async (data) => {
    return chapterRepo.create(data);
};

/** Cập nhật chapter (Admin) */
exports.updateChapter = async (id, data) => {
    const chapter = await chapterRepo.update(id, data);
    if (!chapter) throw new AppError('Chapter không tồn tại', 404);
    return chapter;
};

/** Xóa chapter (soft delete) — ẩn chapter và giảm chapterCount của story */
exports.deleteChapter = async (id) => {
    const chapter = await chapterRepo.softDelete(id);
    if (!chapter) throw new AppError('Chapter không tồn tại hoặc đã bị ẩn', 404);

    await storyRepo.decrementChapterCount(chapter.storyId);

    // Chapter VIP bị ẩn → bồi thường xu cho user đã từng đọc & từng mua VIP.
    // Chapter thường bị ẩn không cần refund.
    let refund = { refundedUsers: 0, coinsPerUser: 0, totalCoins: 0 };
    if (chapter.isVip) {
        refund = await refundService.refundForHiddenVipChapters({
            storyId: chapter.storyId,
            vipChapterCount: 1,
            description: `Bồi thường ẩn Chapter ${chapter.chapterNumber} (VIP)`
        });
    }

    return { message: 'Đã ẩn chapter thành công', refund };
};

/** Admin: Danh sách chapter đã ẩn của truyện */
exports.getHiddenChaptersByStory = async (storyId) => {
    return chapterRepo.findHiddenByStoryId(storyId);
};

/** Khôi phục chapter đã ẩn */
exports.restoreChapter = async (id) => {
    const chapter = await chapterRepo.restore(id);
    if (!chapter) throw new AppError('Chapter không tồn tại hoặc chưa bị ẩn', 404);

    await storyRepo.incrementChapterCount(chapter.storyId);
    return { message: 'Khôi phục chapter thành công' };
};
