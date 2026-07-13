const reportService = require('../services/reportService');

exports.createReport = async (req, res, next) => {
    try {
        const report = await reportService.createReport(req.user.id, req.body);
        res.status(201).json({ message: 'Gửi báo cáo vi phạm thành công', report });
    } catch (error) {
        next(error);
    }
};

exports.getAllReports = async (req, res, next) => {
    try {
        const reports = await reportService.getAllReports();
        res.json(reports);
    } catch (error) {
        next(error);
    }
};

exports.getReportById = async (req, res, next) => {
    try {
        const report = await reportService.getReportById(req.params.id);
        res.json(report);
    } catch (error) {
        next(error);
    }
};

exports.resolveReport = async (req, res, next) => {
    try {
        const result = await reportService.resolveReport(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
