const express = require('express');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Plan = require('../models/Plan');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
  next();
}

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

// ---------- Admin routes ----------

// List every user (never includes password hashes)
router.get('/', adminOnly, async (req, res) => {
  const users = await User.find().select('name email role trainerId createdAt').sort({ createdAt: -1 });
  res.json(users);
});

// Change a user's role
router.put('/:id/role', adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['member', 'trainer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot change your own role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('name email role');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Invalid user id' });
  }
});

// Delete a user and everything that belongs to them
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await Workout.deleteMany({ userId: user._id });
    await Plan.deleteMany({ $or: [{ memberId: user._id }, { trainerId: user._id }] });
    await User.updateMany({ trainerId: user._id }, { trainerId: null });
    res.json({ deleted: true });
  } catch (err) {
    res.status(400).json({ error: 'Invalid user id' });
  }
});

module.exports = router;