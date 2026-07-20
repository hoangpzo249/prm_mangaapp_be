const storyRepo = require('../repositories/storyRepository');
const chapterRepo = require('../repositories/chapterRepository');
const ratingRepo = require('../repositories/ratingRepository');
const bookmarkRepo = require('../repositories/bookmarkRepository');
const refundService = require('./refundService');
const slugify = require('../utils/slugify');
const AppError = require('../utils/AppError');

// ============================================================
// Story Service — Business logic cho truyện
// ============================================================

/** Helper: gắn latestChapter vào mỗi story */
const attachLatestChapters = async (stories, limit = 1) => {
    return Promise.all(
        stories.map(async (story) => {
            const chapters = await chapterRepo.findLatestByStoryId(story._id, limit);
            return {
                ...story,
                latestChapter: limit === 1 ? (chapters[0] || null) : undefined,
                latestChapters: limit > 1 ? chapters : undefined
            };
        })
    );
};

/** Lấy tất cả truyện + latest chapter */
exports.getAllStories = async () => {
    const stories = await storyRepo.findAll('title thumbnail views slug');
    return attachLatestChapters(stories);
};

/** Truyện hot */
exports.getHotStories = async () => {
    return storyRepo.findHot(5);
};

/** Random truyện */
exports.getRandomStories = async () => {
    const stories = await storyRepo.findRandom(10);
    return attachLatestChapters(stories);
};

/** Cập nhật gần đây */
exports.getRecentUpdates = async () => {
    const stories = await storyRepo.findRecent(10);
    return attachLatestChapters(stories, 3);
};

/** Tìm kiếm */
exports.searchStories = async (keyword) => {
    if (!keyword) throw new AppError('Keyword là bắt buộc', 400);
    const stories = await storyRepo.search(keyword);
    return attachLatestChapters(stories);
};

/** Chi tiết truyện + tăng views + rating + bookmarkCount */
exports.getStoryById = async (id) => {
    const story = await storyRepo.incrementViews(id);
    if (!story) throw new AppError('Truyện không tồn tại', 404);

    // Tính toán aggregate tại thời điểm query
    const [ratingStats, bookmarkCount] = await Promise.all([
        ratingRepo.getAverageRating(id),
        bookmarkRepo.countByStory(id)
    ]);

    const storyObj = story.toObject();
    storyObj.averageRating = ratingStats.averageRating;
    storyObj.ratingCount = ratingStats.ratingCount;
    storyObj.bookmarkCount = bookmarkCount;

    return storyObj;
};

/** Tạo truyện mới (Admin) */
exports.createStory = async (data) => {
    data.slug = slugify(data.title);
    return storyRepo.create(data);
};

/** Cập nhật truyện (Admin) */
exports.updateStory = async (id, data) => {
    if (data.title) {
        data.slug = slugify(data.title);
    }
    const story = await storyRepo.update(id, data);
    if (!story) throw new AppError('Truyện không tồn tại', 404);
    return story;
};

/** Xóa truyện (Admin) — soft delete + ẩn cascade toàn bộ chapter */
exports.deleteStory = async (id) => {
    // Đếm VIP chapter đang hiển thị TRƯỚC khi ẩn để tính refund chính xác
    const vipChapterCount = await chapterRepo.countVisibleVipByStoryId(id);

    const story = await storyRepo.softDelete(id);
    if (!story) throw new AppError('Truyện không tồn tại hoặc đã bị ẩn', 404);

    await chapterRepo.hideByStoryId(id);
    await storyRepo.update(id, { chapterCount: 0 });

    // Nếu truyện có VIP chapter → bồi thường user đã từng đọc & từng mua VIP
    let refund = { refundedUsers: 0, coinsPerUser: 0, totalCoins: 0 };
    if (vipChapterCount > 0) {
        refund = await refundService.refundForHiddenVipChapters({
            storyId: id,
            vipChapterCount,
            description: `Bồi thường ${vipChapterCount} chapter VIP bị ẩn ` +
                `(truyện "${story.title}")`
        });
    }

    return { message: 'Đã ẩn truyện thành công', refund };
};

/** Admin: Danh sách truyện đã ẩn */
exports.getHiddenStories = async () => {
    return storyRepo.findHidden();
};

/** Khôi phục truyện đã ẩn (Admin) — bỏ ẩn cascade toàn bộ chapter */
exports.restoreStory = async (id) => {
    const story = await storyRepo.restore(id);
    if (!story) throw new AppError('Truyện không tồn tại hoặc chưa bị ẩn', 404);

    await chapterRepo.unhideByStoryId(id);

    const visibleCount = await chapterRepo.countVisibleByStoryId(id);
    await storyRepo.update(id, { chapterCount: visibleCount });

    return { message: 'Khôi phục truyện thành công' };
};
