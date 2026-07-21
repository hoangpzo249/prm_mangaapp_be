const chapterRepo = require('../repositories/chapterRepository');
const storyRepo = require('../repositories/storyRepository');
const userRepo = require('../repositories/userRepository');
const bookmarkRepo = require('../repositories/bookmarkRepository');
const notificationService = require('./notificationService');
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

/** Ẩn chapter (soft delete) — nếu VIP thì hoàn xu cho user đã đọc & từng mua VIP */
exports.deleteChapter = async (id) => {
    // Cần biết chapter thuộc truyện nào và có VIP không TRƯỚC khi ẩn
    const original = await chapterRepo.findByIdIncludeHidden(id);
    if (!original || original.isHidden) {
        throw new AppError('Chapter không tồn tại hoặc đã bị ẩn', 404);
    }

    const chapter = await chapterRepo.softDelete(id);
    if (!chapter) throw new AppError('Chapter không tồn tại hoặc đã bị ẩn', 404);

    const storyId = chapter.storyId?._id || chapter.storyId;
    await storyRepo.decrementChapterCount(storyId);

    let refund = { refundedUsers: 0, coinsPerUser: 0, totalCoins: 0 };
    if (chapter.isVip) {
        // Refund công bằng: chỉ user đã đọc CHÍNH chapter này khi đang là VIP
        refund = await refundService.refundForHiddenVipChapter({
            storyId,
            chapterId: chapter._id,
            chapterNumber: chapter.chapterNumber
        });
    }

    return { message: 'Đã ẩn chapter thành công', refund };
};

/** Khôi phục chapter đã ẩn */
exports.restoreChapter = async (id) => {
    const chapter = await chapterRepo.restore(id);
    if (!chapter) throw new AppError('Chapter không tồn tại hoặc chưa bị ẩn', 404);

    const storyId = chapter.storyId?._id || chapter.storyId;
    await storyRepo.incrementChapterCount(storyId);

    return { message: 'Đã khôi phục chapter thành công' };
};

/** Danh sách chapter đã ẩn của truyện (Admin) */
exports.getHiddenChaptersByStory = async (storyId) => {
    return chapterRepo.findHiddenByStoryId(storyId);
};