const mongoose = require('mongoose')

const chapterSchema = new mongoose.Schema({
    storyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Story",
    },
    chapterNumber: {
        type: Number,
        required: true
    },
    chapterTitle: String,
    image: [
        {
            type: String
        }
    ],
    isVip: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

chapterSchema.index({ storyId: 1, chapterNumber: 1 });

module.exports = mongoose.model("Chapter", chapterSchema);