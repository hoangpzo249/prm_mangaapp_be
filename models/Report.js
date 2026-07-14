const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'reporterId là bắt buộc']
    },
    targetType: {
        type: String,
        enum: ['comment', 'story'],
        required: [true, 'targetType là bắt buộc (comment hoặc story)']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'targetId là bắt buộc']
    },
    reason: {
        type: String,
        required: [true, 'Lý do báo cáo là bắt buộc']
    },
    status: {
        type: String,
        enum: ['pending', 'resolved', 'dismissed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Index to quickly fetch pending reports or specific target types
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
