const mongoose = require('mongoose');

const readingHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  surahNumber: {
    type: Number,
    required: true,
  },
  verseNumber: {
    type: Number,
    required: true,
  },
  lastReadAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ReadingHistory', readingHistorySchema);
