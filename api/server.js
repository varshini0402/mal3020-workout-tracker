const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/workouts';

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3000, () => console.log('API running on port 3000'));
  })
  .catch(err => console.error('MongoDB connection error:', err));