import { useEffect, useState } from 'react';
import { request } from '../api';

export default function AdminDashboard({ token, currentUserId }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  // Load users on first render and whenever "refresh" changes
  useEffect(() => {
    let cancelled = false;
    request('/users', { token })
      .then((data) => { if (!cancelled) setUsers(data); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [token, refresh]);

  const reload = () => setRefresh((n) => n + 1);

  const changeRole = async (id, role) => {
    setError('');
    try {
      await request(`/users/${id}/role`, { method: 'PUT', token, body: { role } });
      reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (user) => {
    if (!window.confirm(`Delete ${user.name}? Their workouts and plans will be deleted too.`)) return;
    setError('');
    try {
      await request(`/users/${user._id}`, { method: 'DELETE', token });
      reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const count = (role) => users.filter((u) => u.role === role).length;

  return (
    <div>
      <div className="card">
        <h2>Overview</h2>
        <p>
          {users.length} users: {count('member')} members, {count('trainer')} trainers, {count('admin')} admins
        </p>
      </div>

      <div className="card">
        <h2>Manage users</h2>
        {error && <p className="error">{error}</p>}
        {users.map((u) => (
          <div className="workout" key={u._id}>
            <div>
              <strong>{u.name}</strong>
              <div className="detail">{u.email}</div>
            </div>
            <div className="row">
              <select
                value={u.role}
                disabled={u._id === currentUserId}
                onChange={(e) => changeRole(u._id, e.target.value)}
              >
                <option value="member">Member</option>
                <option value="trainer">Trainer</option>
                <option value="admin">Admin</option>
              </select>
              {u._id !== currentUserId && (
                <button className="danger" onClick={() => remove(u)}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}