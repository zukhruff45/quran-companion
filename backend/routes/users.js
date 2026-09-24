const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/me', async (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
});

router.put('/me', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    updates.forEach((update) => req.user[update] = req.body[update]);
    await req.user.save();
    res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
