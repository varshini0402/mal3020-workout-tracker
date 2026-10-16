import { useEffect, useState } from 'react';
import { request } from '../api';

export default function TrainerPicker({ token }) {
  const [trainers, setTrainers] = useState([]);
  const [selected, setSelected] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    request('/users/trainers', { token }).then(setTrainers).catch(() => {});
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
      <div className="row">
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">Choose a trainer...</option>
          {trainers.map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>
        <button onClick={save} disabled={!selected}>Save</button>
      </div>
      {message && <p className="detail">{message}</p>}
    </div>
  );
}