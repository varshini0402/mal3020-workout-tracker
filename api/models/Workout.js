const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['gym', 'swim'], required: true },
  durationMinutes: { type: Number, required: true, min: 1 },
  notes: String,
  exercises: [{
    name: String,
    sets: Number,
    reps: Number,
    weightKg: Number
  }],
  swim: {
    laps: Number,
    distanceMeters: Number,
    stroke: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);