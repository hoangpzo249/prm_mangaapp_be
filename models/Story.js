const mongoose = require('mongoose')

const storySchema = new mongoose.Schema({
    title: String,
    slug: {
        type: String,
        unique: true
    },
    author: String,
    thumbnail: String,
    chapterCount: Number,
    description: {
        type: String,
        default: "Đang cập nhật..."
    },
    views: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["Ongoing", "Complete"],
        default: "Ongoing"
    }
}, { timestamps: true });

// Indexing for faster queries
storySchema.index({ slug: 1 }, { unique: true });
storySchema.index({ views: -1 });

module.exports = mongoose.model("Story", storySchema);