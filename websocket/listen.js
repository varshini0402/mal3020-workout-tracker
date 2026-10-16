const { io } = require('socket.io-client');

const token = process.argv[2];
const socket = io('http://localhost:4000', { auth: { token } });

socket.on('connect', () => console.log('Connected, waiting for live updates...'));
socket.on('connect_error', (err) => console.log('Connection failed:', err.message));
socket.on('workout:logged', (data) => {
  console.log(`LIVE: ${data.memberName} logged a ${data.workout.type} workout (${data.workout.durationMinutes} min)`);
});