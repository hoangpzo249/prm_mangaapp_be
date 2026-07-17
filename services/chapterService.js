const chapterRepo = require('../repositories/chapterRepository');
const storyRepo = require('../repositories/storyRepository');
const userRepo = require('../repositories/userRepository');
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

        const user = await userRepo.findByIdWithPassword(userId);
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

/** Cập nhật chapter */
exports.updateChapter = async (id, data) => {
    const chapter = await chapterRepo.update(id, data);
    if (!chapter) throw new AppError('Chapter không tồn tại', 404);
    return chapter;
};

/** Xóa chapter — dùng findOneAndDelete để trigger hook */
exports.deleteChapter = async (id) => {
    const chapter = await chapterRepo.delete(id);
    if (!chapter) throw new AppError('Chapter không tồn tại', 404);
    return { message: 'Xóa chapter thành công' };
};
