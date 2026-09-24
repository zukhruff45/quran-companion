const express = require('express');
const Bookmark = require('../models/Bookmark');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookmarks.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { surahNumber, verseNumber, arabicText, translation } = req.body;
    
    const existingBookmark = await Bookmark.findOne({ 
      userId: req.user._id, 
      surahNumber, 
      verseNumber 
    });

    if (existingBookmark) {
      return res.status(400).json({ error: 'Verse already bookmarked.' });
    }

    const bookmark = new Bookmark({
      userId: req.user._id,
      surahNumber,
      verseNumber,
      arabicText,
      translation,
    });
    
    await bookmark.save();
    res.status(201).json(bookmark);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bookmark.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found.' });
    }
    res.json({ message: 'Bookmark removed.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bookmark.' });
  }
});

module.exports = router;
