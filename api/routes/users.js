const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// List all trainers (so a member can choose one)
router.get('/trainers', async (req, res) => {
  const trainers = await User.find({ role: 'trainer' }).select('name email');
  res.json(trainers);
});

// A member chooses their trainer
router.put('/me/trainer', async (req, res) => {
  try {
    const trainer = await User.findOne({ _id: req.body.trainerId, role: 'trainer' });
    if (!trainer) return res.status(404).json({ error: 'Trainer not found' });
    await User.findByIdAndUpdate(req.user.id, { trainerId: trainer._id });
    res.json({ trainerId: trainer._id });
  } catch (err) {
    res.status(400).json({ error: 'Invalid trainer id' });
  }
});

// A trainer lists their members
router.get('/my-members', async (req, res) => {
  if (req.user.role !== 'trainer') return res.status(403).json({ error: 'Trainers only' });
  const members = await User.find({ trainerId: req.user.id }).select('name email');
  res.json(members);
});

module.exports = router;