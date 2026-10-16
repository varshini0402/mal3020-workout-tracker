const express = require('express');
const Workout = require('../models/Workout');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth); // every route below needs a valid token

const fields = ['date', 'type', 'durationMinutes', 'notes', 'exercises', 'swim'];
function pick(body) {
  const out = {};
  fields.forEach(f => { if (body[f] !== undefined) out[f] = body[f]; });
  return out;
}

// Read: your own workouts (admins see everyone's)
router.get('/', async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const workouts = await Workout.find(filter).sort({ date: -1 });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    const workout = await Workout.create({ ...pick(req.body), userId: req.user.id });
    res.status(201).json(workout);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update (only your own)
router.put('/:id', async (req, res) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      pick(req.body),
      { new: true, runValidators: true }
    );
    if (!workout) return res.status(404).json({ error: 'Workout not found' });
    res.json(workout);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete (only your own)
router.delete('/:id', async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!workout) return res.status(404).json({ error: 'Workout not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;