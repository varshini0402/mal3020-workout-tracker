import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { request } from '../api';
import PlanManager from './PlanManager';

export default function TrainerDashboard({ token }) {
  const [members, setMembers] = useState([]);
  const [feed, setFeed] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    request('/users/my-members', { token }).then(setMembers).catch(() => {});

    // Open the WebSocket connection, authenticated with the same JWT
    const socket = io('http://localhost:4000', { auth: { token } });
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('workout:logged', (data) => {
      setFeed((prev) => [{ ...data, at: new Date() }, ...prev]);
    });

    return () => socket.disconnect();
  }, [token]);

  return (
    <div>
      <div className="card">
        <h2>
          Live activity{' '}
          <span className={connected ? 'status on' : 'status off'}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </h2>
        {feed.length === 0 && <p>Waiting for your members to log workouts...</p>}
        {feed.map((item, i) => (
          <div className="workout" key={i}>
            <div>
              <strong>{item.memberName}</strong> logged a {item.workout.type} workout
              ({item.workout.durationMinutes} min)
              <div className="detail">{item.at.toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>My members</h2>
        {members.length === 0 && <p>No members assigned yet.</p>}
        {members.map((m) => (
          <div className="workout" key={m._id}>
            <div>
              <strong>{m.name}</strong>
              <div className="detail">{m.email}</div>
            </div>
          </div>
        ))}
      </div>

      <PlanManager token={token} members={members} />
    </div>
  );
}