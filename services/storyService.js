const storyRepo = require('../repositories/storyRepository');
const chapterRepo = require('../repositories/chapterRepository');
const ratingRepo = require('../repositories/ratingRepository');
const bookmarkRepo = require('../repositories/bookmarkRepository');
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

/** Xóa truyện + chapters (Admin) */
exports.deleteStory = async (id) => {
    await chapterRepo.deleteByStoryId(id);
    const story = await storyRepo.delete(id);
    if (!story) throw new AppError('Truyện không tồn tại', 404);
    return { message: 'Xóa truyện thành công' };
};
