const chapterRepo = require('../repositories/chapterRepository');
const storyRepo = require('../repositories/storyRepository');
const userRepo = require('../repositories/userRepository');
const bookmarkRepo = require('../repositories/bookmarkRepository');
const notificationService = require('./notificationService');

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
    // 1. Kiểm tra truyện tồn tại trước khi tạo chapter
    const story = await storyRepo.findById(data.storyId);

    if (!story) {
        throw new AppError('Truyện không tồn tại', 404);
    }

    // 2. Tạo chapter
    const chapter = await chapterRepo.create(data);

    // Tránh trường hợp storyId đã được populate thành object
    const actualStoryId =
        chapter.storyId?._id || chapter.storyId;

    // 3. Tìm những người đã bookmark truyện
    const followers =
        await bookmarkRepo.findUsersByStoryId(actualStoryId);

    // 4. Tạo danh sách thông báo
    const notifications = followers.map((user) => ({
        userId: user.userId,

        type: 'NEW_CHAPTER',

        title: 'Chapter mới',

        message:
            `${story.title} đã cập nhật Chapter ${chapter.chapterNumber}`,

        link:
            `/story/${actualStoryId}/chapter/${chapter._id}`,
    }));

    // 5. Gửi nhiều thông báo
    if (notifications.length > 0) {
        await notificationService.sendBulkNotification(
            notifications,
        );
    }

    return chapter;
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