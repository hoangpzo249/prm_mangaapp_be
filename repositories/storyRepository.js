const Story = require('../models/Story');
const Genre = require('../models/Genre');

// ============================================================
// Story Repository — Data access layer cho Story
// ============================================================

// Field select mặc định khi populate genres (bỏ createdAt/updatedAt/__v)
const GENRE_POPULATE = { path: 'genres', select: 'name slug' };

exports.findAll = (select) => {
    return Story.find({ isHidden: { $ne: true } })
        .select(select || '')
        .populate(GENRE_POPULATE)
        .lean();
};

exports.findById = (id) => {
    return Story.findOne({ _id: id, isHidden: { $ne: true } })
        .populate(GENRE_POPULATE);
};

exports.create = (data) => {
    const story = new Story(data);
    return story.save();
};

exports.update = (id, data) => {
    return Story.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

/** Soft delete — set isHidden = true */
exports.softDelete = (id) => {
    return Story.findOneAndUpdate(
        { _id: id, isHidden: { $ne: true } },
        { isHidden: true },
        { new: true }
    );
};

/** Khôi phục truyện đã ẩn */
exports.restore = (id) => {
    return Story.findOneAndUpdate(
        { _id: id, isHidden: true },
        { isHidden: false },
        { new: true }
    );
};

/** Bao gồm cả story đã ẩn — dùng cho admin restore */
exports.findByIdIncludeHidden = (id) => {
    return Story.findById(id);
};

/** Danh sách truyện đã ẩn — cho admin xem/khôi phục */
exports.findHidden = () => {
    return Story.find({ isHidden: true })
        .sort({ updatedAt: -1 })
        .populate(GENRE_POPULATE)
        .lean();
};

exports.incrementChapterCount = (id) => {
    return Story.findByIdAndUpdate(id, { $inc: { chapterCount: 1 } });
};

exports.decrementChapterCount = (id) => {
    return Story.findByIdAndUpdate(id, { $inc: { chapterCount: -1 } });
};

/** Tăng lượt xem + trả về story mới */
exports.incrementViews = (id) => {
    return Story.findOneAndUpdate({ _id: id, isHidden: { $ne: true } }, { $inc: { views: 1 } }, { new: true })
        .populate(GENRE_POPULATE);
};

/** Truyện hot — sắp xếp theo views giảm dần */
exports.findHot = (limit = 5) => {
    return Story.find({ isHidden: { $ne: true } })
        .sort({ views: -1 })
        .limit(limit)
        .select('title thumbnail views slug description genres')
        .populate(GENRE_POPULATE)
        .lean();
};

/** Cập nhật gần đây — sắp xếp theo updatedAt */
exports.findRecent = (limit = 10) => {
    return Story.find({ isHidden: { $ne: true } })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .populate(GENRE_POPULATE)
        .lean();
};

/** Random truyện cho Featured section */
exports.findRandom = async (size = 10) => {
    const stories = await Story.aggregate([
        { $match: { isHidden: { $ne: true } } },
        { $sample: { size } },
        {
            $project: {
                _id: 1, title: 1, thumbnail: 1, views: 1,
                description: 1, genres: 1, status: 1
            }
        }
    ]);

    // $lookup thay thế populate cho aggregate — gọn hơn khi cần vài field
    const genreIds = [...new Set(
        stories.flatMap(s => (s.genres || []).map(String))
    )];
    if (genreIds.length === 0) return stories;

    const genres = await Genre.find({ _id: { $in: genreIds } })
        .select('name slug')
        .lean();
    const genreMap = new Map(genres.map(g => [String(g._id), g]));

    return stories.map(s => ({
        ...s,
        genres: (s.genres || [])
            .map(id => genreMap.get(String(id)))
            .filter(Boolean)
    }));
};

/** Tìm kiếm theo keyword (regex trên title) */
exports.search = (keyword) => {
    return Story.find({
        title: { $regex: keyword, $options: 'i' },
        isHidden: { $ne: true }
    })
        .populate(GENRE_POPULATE)
        .lean();
};
