const Report = require('../models/Report');
const Comment = require('../models/Comment');
const Story = require('../models/Story');

exports.create = (data) => {
    const report = new Report(data);
    return report.save();
};

exports.findAll = async () => {
    const reports = await Report.find()
        .populate('reporterId', 'username fullName')
        .sort({ createdAt: -1 })
        .lean();

    // Dynamically populate targetId based on targetType
    return Promise.all(reports.map(async (report) => {
        let target = null;
        if (report.targetType === 'comment') {
            target = await Comment.findById(report.targetId)
                .populate('userId', 'username fullName')
                .lean();
        } else if (report.targetType === 'story') {
            target = await Story.findById(report.targetId).lean();
        }
        return { ...report, target };
    }));
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
        target = await Story.findById(report.targetId).lean();
    }
    return { ...report, target };
};

exports.updateStatus = (id, status) => {
    return Report.findByIdAndUpdate(id, { status }, { new: true });
};
