const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('./app');
const User = require('./models/User');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/workouts';

// Create the first admin from environment variables (admins cannot self-register)
async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return;
  await User.create({
    name: 'Admin',
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 10),
    role: 'admin'
  });
  console.log('Admin account created');
}

mongoose.connect(MONGO_URL)
  .then(async () => {
    console.log('Connected to MongoDB');
    await ensureAdmin();
    app.listen(3000, () => console.log('API running on port 3000'));
  })
  .catch(err => console.error('MongoDB connection error:', err));