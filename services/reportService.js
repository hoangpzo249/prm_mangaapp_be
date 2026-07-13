const reportRepo = require('../repositories/reportRepository');
const Comment = require('../models/Comment');
const Story = require('../models/Story');
const AppError = require('../utils/AppError');

exports.createReport = async (reporterId, { targetType, targetId, reason }) => {
    if (!targetType || !targetId || !reason) {
        throw new AppError('targetType, targetId và reason là bắt buộc', 400);
    }

    if (!['comment', 'story'].includes(targetType)) {
        throw new AppError('targetType không hợp lệ', 400);
    }

    // Verify target exists
    if (targetType === 'comment') {
        const comment = await Comment.findById(targetId);
        if (!comment) throw new AppError('Bình luận được báo cáo không tồn tại', 404);
    } else {
        const story = await Story.findById(targetId);
        if (!story) throw new AppError('Truyện được báo cáo không tồn tại', 404);
    }

    return reportRepo.create({
        reporterId,
        targetType,
        targetId,
        reason
    });
};

exports.getAllReports = async () => {
    return reportRepo.findAll();
};

exports.getReportById = async (id) => {
    const report = await reportRepo.findById(id);
    if (!report) throw new AppError('Báo cáo không tồn tại', 404);
    return report;
};

exports.resolveReport = async (id, { action }) => {
    if (!['approve', 'dismiss'].includes(action)) {
        throw new AppError('Action không hợp lệ (chỉ approve hoặc dismiss)', 400);
    }

    const report = await reportRepo.findById(id);
    if (!report) throw new AppError('Báo cáo không tồn tại', 404);

    if (action === 'approve') {
        // Duyệt ẩn comment hoặc story
        if (report.targetType === 'comment') {
            await Comment.findByIdAndUpdate(report.targetId, { isHidden: true });
        } else if (report.targetType === 'story') {
            await Story.findByIdAndUpdate(report.targetId, { isHidden: true });
        }
        await reportRepo.updateStatus(id, 'resolved');
    } else {
        // Bỏ qua báo cáo
        await reportRepo.updateStatus(id, 'dismissed');
    }

    return { message: 'Xử lý báo cáo thành công' };
};
