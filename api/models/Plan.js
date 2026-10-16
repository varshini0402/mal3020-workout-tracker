const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  items: [{
    exercise: String,
    sets: Number,
    reps: Number,
    dayOfWeek: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);