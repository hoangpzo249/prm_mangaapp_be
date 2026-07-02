const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    storyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
        required: true
    },
    lastChapterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('History', historySchema);