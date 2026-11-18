import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { request } from '../api';
import { Dumbbell, Waves } from './Icons';
import PlanManager from './PlanManager';

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function summary(w) {
  if (w.type === 'gym') {
    const x = w.exercises?.[0];
    return x ? `${x.name} · ${x.sets} × ${x.reps} · ${x.weightKg} kg` : 'Gym session';
  }
  if (w.swim?.laps != null) return `${w.swim.laps} laps · ${w.swim.distanceMeters} m · ${w.swim.stroke}`;
  return 'Swim session';
}

export default function TrainerDashboard({ token }) {
  const [members, setMembers] = useState([]);
  const [feed, setFeed] = useState([]);
  const [connected, setConnected] = useState(false);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState('');

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

  const openMember = async (m) => {
    setSelected(m);
    setHistory([]);
    setHistoryError('');
    try {
      setHistory(await request(`/users/my-members/${m._id}/workouts`, { token }));
    } catch (err) {
      setHistoryError(err.message);
    }
  };

  const time = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <div className="coach-grid">
        <div className="card dark">
          <div className="feed-head">
            <h2>Live activity</h2>
            <span className={connected ? 'status on' : 'status off'}>
              <i className="dot" />{connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {feed.length === 0 && <p>Waiting for your members to log workouts...</p>}
          {feed.map((item, i) => (
            <div className="feed-row" key={i}>
              <div className={`avatar ${item.workout.type}`}>
                {item.workout.type === 'gym'
                  ? <Dumbbell size={22} color="#0b1a2b" />
                  : <Waves size={22} color="#0b1a2b" />}
              </div>
              <div className="feed-text">
                {item.memberName} logged a {item.workout.type} workout ({item.workout.durationMinutes} min)
              </div>
              <div className="feed-time">{time(item.at)}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2>My members</h2>
          {members.length === 0 && <p>No members assigned yet.</p>}
          {members.map((m, i) => (
            <div className="member-row" key={m._id}>
              <div className={`avatar ${i % 2 ? 'swim' : 'gym'}`}>
                <strong>{m.name.charAt(0).toUpperCase()}</strong>
              </div>
              <div>
                <strong>{m.name}</strong>
                <div className="detail">{m.email}</div>
              </div>
              <button className="secondary view-btn" onClick={() => openMember(m)}>View workouts</button>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="card">
          <h2>{selected.name}'s workouts</h2>
          {historyError && <p className="error">{historyError}</p>}
          {!historyError && history.length === 0 && <p>No workouts logged yet.</p>}
          {history.map((w) => (
            <div className="wk-row" key={w._id}>
              <div className={`wk-tile ${w.type}`}>
                {w.type === 'gym' ? <Dumbbell size={22} color="#0b1a2b" /> : <Waves size={22} color="#0b1a2b" />}
                {w.type}
              </div>
              <div className="wk-info">
                <div className="wk-meta">{w.durationMinutes} min · {fmtDate(w.date)}</div>
                <div className="wk-main">{summary(w)}</div>
                {w.notes && <div className="detail">{w.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <PlanManager token={token} members={members} />
    </div>
  );
}