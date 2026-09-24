const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
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
  arabicText: {
    type: String,
    required: true,
  },
  translation: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
