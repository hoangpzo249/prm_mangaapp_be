const Report = require('../models/Report');
const Comment = require('../models/Comment');
const Story = require('../models/Story');

exports.create = (data) => {
    const report = new Report(data);
    return report.save();
};

/**
 * findAll — với filter theo status (optional) và pagination
 */
exports.findAll = async ({ status, page = 1, limit = 20 } = {}) => {
    const query = {};
    if (status && ['pending', 'resolved', 'dismissed'].includes(status)) {
        query.status = status;
    }

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
        Report.find(query)
            .populate('reporterId', 'username fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Report.countDocuments(query),
    ]);

    // Dynamically populate targetId based on targetType
    const enriched = await Promise.all(reports.map(async (report) => {
        let target = null;
        if (report.targetType === 'comment') {
            target = await Comment.findById(report.targetId)
                .populate('userId', 'username fullName')
                .lean();
        } else if (report.targetType === 'story') {
            target = await Story.findById(report.targetId, 'title thumbnail slug').lean();
        }
        return { ...report, target };
    }));

    return { reports: enriched, total, page, limit };
};

exports.findById = async (id) => {
    const report = await Report.findById(id)
        .populate('reporterId', 'username fullName')
        .lean();

    if (!report) return null;

    let target = null;
    if (report.targetType === 'comment') {
        target = await Comment.findById(report.targetId)
            .populate('userId', 'username fullName')
            .lean();
    } else if (report.targetType === 'story') {
        target = await Story.findById(report.targetId, 'title thumbnail slug').lean();
    }
    return { ...report, target };
};

exports.updateStatus = (id, status, adminNote) => {
    const update = { status };
    if (adminNote !== undefined && adminNote !== null) {
        update.adminNote = adminNote;
    }
    return Report.findByIdAndUpdate(id, update, { new: true });
};
