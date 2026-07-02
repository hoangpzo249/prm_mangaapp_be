const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true
  }
}, { timestamps: true });

bookmarkSchema.index({ userId: 1, storyId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);