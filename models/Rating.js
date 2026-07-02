const mongoose = require('mongoose');

// ============================================================
// Rating Model — Đánh giá truyện (1-5 sao)
// ============================================================
// - Mỗi user chỉ đánh giá 1 lần cho mỗi truyện (unique compound)
// - averageRating sẽ được tính ở Repository layer bằng aggregation
//   pipeline khi query, KHÔNG lưu trực tiếp trong Story
// ============================================================

const ratingSchema = new mongoose.Schema({
    // Người đánh giá
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'userId là bắt buộc']
    },

    // Truyện được đánh giá
    storyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
        required: [true, 'storyId là bắt buộc']
    },

    // Điểm đánh giá: 1 đến 5 sao
    score: {
        type: Number,
        required: [true, 'Điểm đánh giá là bắt buộc'],
        min: [1, 'Điểm tối thiểu là 1'],
        max: [5, 'Điểm tối đa là 5']
    }

}, {
    timestamps: true
});

// ============================================================
// Indexes
// ============================================================
// Mỗi user chỉ rate 1 lần cho mỗi truyện
ratingSchema.index({ userId: 1, storyId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
