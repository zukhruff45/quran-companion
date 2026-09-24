const express = require('express');
const ReadingHistory = require('../models/ReadingHistory');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const history = await ReadingHistory.find({ userId: req.user._id })
      .sort({ lastReadAt: -1 })
      .limit(20);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reading history.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { surahNumber, verseNumber } = req.body;
    
    // Update existing if exists, else create new
    let history = await ReadingHistory.findOne({
      userId: req.user._id,
      surahNumber,
    });

    if (history) {
      history.verseNumber = verseNumber;
      history.lastReadAt = Date.now();
      await history.save();
    } else {
      history = new ReadingHistory({
        userId: req.user._id,
        surahNumber,
        verseNumber,
      });
      await history.save();
    }
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reading history.' });
  }
});

router.delete('/all', async (req, res) => {
  try {
    await ReadingHistory.deleteMany({ userId: req.user._id });
    res.json({ message: 'All history removed.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear history.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const history = await ReadingHistory.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!history) {
      return res.status(404).json({ error: 'History not found.' });
    }
    res.json({ message: 'History removed.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete history.' });
  }
});

module.exports = router;
