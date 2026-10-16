const express = require('express');
const Plan = require('../models/Plan');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function trainerOnly(req, res, next) {
  if (req.user.role !== 'trainer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Trainers only' });
  }
  next();
}

// Read: members see their plans, trainers see plans they created, admins see all
router.get('/', async (req, res) => {
  let filter = {};
  if (req.user.role === 'member') filter = { memberId: req.user.id };
  if (req.user.role === 'trainer') filter = { trainerId: req.user.id };
  const plans = await Plan.find(filter).sort({ createdAt: -1 });
  res.json(plans);
});

// Create: only for one of your own members
router.post('/', trainerOnly, async (req, res) => {
  try {
    const { memberId, title, items } = req.body;
    const member = await User.findById(memberId);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    if (req.user.role === 'trainer' && String(member.trainerId) !== req.user.id) {
      return res.status(403).json({ error: 'That member is not assigned to you' });
    }
    const plan = await Plan.create({ trainerId: req.user.id, memberId, title, items });
    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update (only plans you created)
router.put('/:id', trainerOnly, async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, trainerId: req.user.id };
    const plan = await Plan.findOneAndUpdate(
      filter,
      { title: req.body.title, items: req.body.items },
      { new: true, runValidators: true }
    );
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete (only plans you created)
router.delete('/:id', trainerOnly, async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, trainerId: req.user.id };
    const plan = await Plan.findOneAndDelete(filter);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;