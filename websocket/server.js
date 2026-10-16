const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const INTERNAL_KEY = process.env.INTERNAL_KEY || 'dev-internal-key';

const app = express();
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Only logged-in users can open a WebSocket connection
io.use((socket, next) => {
  try {
    socket.user = jwt.verify(socket.handshake.auth.token, JWT_SECRET);
    next();
  } catch (err) {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  // Each user joins a private room named after their user id
  socket.join(`user:${socket.user.id}`);
  console.log(`Connected: ${socket.user.id} (${socket.user.role})`);
  socket.on('disconnect', () => console.log(`Disconnected: ${socket.user.id}`));
});

// The API server calls this when a member logs a workout
app.post('/internal/workout-logged', (req, res) => {
  if (req.headers['x-internal-key'] !== INTERNAL_KEY) {
    return res.status(401).json({ error: 'Not allowed' });
  }
  const { trainerId, memberName, workout } = req.body;
  io.to(`user:${trainerId}`).emit('workout:logged', { memberName, workout });
  res.json({ sent: true });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

server.listen(4000, () => console.log('WebSocket server running on port 4000'));