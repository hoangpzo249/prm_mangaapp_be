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

exports.getAllReports = async ({ status, page = 1, limit = 20 } = {}) => {
    return reportRepo.findAll({ status, page: Number(page), limit: Number(limit) });
};

exports.getReportById = async (id) => {
    const report = await reportRepo.findById(id);
    if (!report) throw new AppError('Báo cáo không tồn tại', 404);
    return report;
};

exports.resolveReport = async (id, { action, adminNote }) => {
    const normalizedAction = action === 'resolve'
        ? 'approve'
        : action === 'reject'
            ? 'dismiss'
            : action;

    if (!['approve', 'dismiss'].includes(normalizedAction)) {
        throw new AppError('Action không hợp lệ (chỉ approve hoặc dismiss)', 400);
    }

    const report = await reportRepo.findById(id);
    if (!report) throw new AppError('Báo cáo không tồn tại', 404);
    if (report.status !== 'pending') throw new AppError('Báo cáo này đã được xử lý trước đó', 400);

    if (normalizedAction === 'approve') {
        // Duyệt: ẩn nội dung vi phạm
        if (report.targetType === 'comment') {
            await Comment.findByIdAndUpdate(report.targetId, { isHidden: true });
        } else if (report.targetType === 'story') {
            await Story.findByIdAndUpdate(report.targetId, { isHidden: true });
        }
        await reportRepo.updateStatus(id, 'resolved', adminNote);
    } else {
        // Từ chối: không ẩn nội dung
        await reportRepo.updateStatus(id, 'dismissed', adminNote);
    }

    return { message: normalizedAction === 'approve' ? 'Đã duyệt và ẩn nội dung vi phạm' : 'Đã từ chối báo cáo' };
};
