import { useEffect, useState } from 'react';
import { request } from '../api';

export default function TrainerPicker({ token }) {
  const [trainers, setTrainers] = useState([]);
  const [selected, setSelected] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([request('/users/trainers', { token }), request('/users/me', { token })])
      .then(([list, me]) => {
        setTrainers(list);
        setSelected(me.trainerId || '');
      })
      .catch(() => {});
  }, [token]);

  const save = async () => {
    try {
      await request('/users/me/trainer', { method: 'PUT', token, body: { trainerId: selected } });
      setMessage('Trainer saved');
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="card">
      <h2>My trainer</h2>
      <div className="stack">
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">Choose a trainer...</option>
          {trainers.map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>
        <button className="save-wide" onClick={save} disabled={!selected}>Save</button>
        {message && <p className="detail">{message}</p>}
      </div>
    </div>
  );
}