const Story = require('../models/Story');

// ============================================================
// Story Repository — Data access layer cho Story
// ============================================================

exports.findAll = (select) => {
    return Story.find().select(select || '').lean();
};

exports.findById = (id) => {
    return Story.findById(id);
};

exports.create = (data) => {
    const story = new Story(data);
    return story.save();
};

exports.update = (id, data) => {
    return Story.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.delete = (id) => {
    return Story.findByIdAndDelete(id);
};

/** Tăng lượt xem + trả về story mới */
exports.incrementViews = (id) => {
    return Story.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
};

/** Truyện hot — sắp xếp theo views giảm dần */
exports.findHot = (limit = 5) => {
    return Story.find()
        .sort({ views: -1 })
        .limit(limit)
        .select('title thumbnail views slug description')
        .lean();
};

/** Cập nhật gần đây — sắp xếp theo updatedAt */
exports.findRecent = (limit = 10) => {
    return Story.find()
        .sort({ updatedAt: -1 })
        .limit(limit)
        .lean();
};

/** Random truyện cho Featured section */
exports.findRandom = (size = 10) => {
    return Story.aggregate([
        { $sample: { size } },
        {
            $project: {
                _id: 1, title: 1, thumbnail: 1, views: 1,
                description: 1, genres: 1, status: 1
            }
        }
    ]);
};

/** Tìm kiếm theo keyword (regex trên title) */
exports.search = (keyword) => {
    return Story.find({
        title: { $regex: keyword, $options: 'i' }
    }).lean();
};
