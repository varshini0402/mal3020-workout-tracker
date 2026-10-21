import { useEffect, useState } from 'react';
import { request } from '../api';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const emptyItem = { exercise: '', sets: '', reps: '', dayOfWeek: 'Monday' };

export default function PlanManager({ token, members }) {
  const [plans, setPlans] = useState([]);
  const [memberId, setMemberId] = useState('');
  const [title, setTitle] = useState('');
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setPlans(await request('/plans', { token }));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const memberName = (id) => members.find((m) => m._id === id)?.name || 'Unknown member';

  const reset = () => {
    setEditingId(null);
    setMemberId('');
    setTitle('');
    setItems([{ ...emptyItem }]);
  };

  const updateItem = (index, field, value) => {
    setItems(items.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };

  const addItem = () => setItems([...items, { ...emptyItem }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const cleanItems = () =>
    items
      .filter((it) => it.exercise.trim())
      .map((it) => ({
        exercise: it.exercise.trim(),
        sets: Number(it.sets) || 0,
        reps: Number(it.reps) || 0,
        dayOfWeek: it.dayOfWeek
      }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await request(`/plans/${editingId}`, { method: 'PUT', token, body: { title, items: cleanItems() } });
      } else {
        if (!memberId) return setError('Please choose a member');
        await request('/plans', { method: 'POST', token, body: { memberId, title, items: cleanItems() } });
      }
      reset();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setMemberId(p.memberId);
    setTitle(p.title);
    setItems(
      p.items.length
        ? p.items.map((i) => ({
            exercise: i.exercise || '',
            sets: i.sets ?? '',
            reps: i.reps ?? '',
            dayOfWeek: i.dayOfWeek || 'Monday'
          }))
        : [{ ...emptyItem }]
    );
  };

  const remove = async (id) => {
    try {
      await request(`/plans/${id}`, { method: 'DELETE', token });
      if (editingId === id) reset();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>{editingId ? 'Edit plan' : 'Create a plan'}</h2>
        <form onSubmit={submit}>
          <select value={memberId} onChange={(e) => setMemberId(e.target.value)} disabled={!!editingId}>
            <option value="">Choose a member...</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
          <input placeholder="Plan title (e.g. 4-week strength plan)" value={title}
            onChange={(e) => setTitle(e.target.value)} required />

          {items.map((it, i) => (
            <div className="item-row" key={i}>
              <input placeholder="Exercise" value={it.exercise}
                onChange={(e) => updateItem(i, 'exercise', e.target.value)} />
              <input type="number" placeholder="Sets" value={it.sets}
                onChange={(e) => updateItem(i, 'sets', e.target.value)} />
              <input type="number" placeholder="Reps" value={it.reps}
                onChange={(e) => updateItem(i, 'reps', e.target.value)} />
              <select value={it.dayOfWeek} onChange={(e) => updateItem(i, 'dayOfWeek', e.target.value)}>
                {days.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {items.length > 1 && (
                <button type="button" className="danger" onClick={() => removeItem(i)}>X</button>
              )}
            </div>
          ))}

          <button type="button" className="secondary" onClick={addItem}>+ Add exercise</button>
          {error && <p className="error">{error}</p>}
          <div className="row">
            <button type="submit">{editingId ? 'Save changes' : 'Create plan'}</button>
            {editingId && <button type="button" className="secondary" onClick={reset}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Plans I created</h2>
        {plans.length === 0 && <p>No plans yet.</p>}
        {plans.map((p) => (
          <div className="workout" key={p._id}>
            <div>
              <strong>{p.title}</strong> <span className="date">for {memberName(p.memberId)}</span>
              {p.items.map((i) => (
                <div key={i._id} className="detail">
                  {i.dayOfWeek}: {i.exercise} ({i.sets} x {i.reps})
                </div>
              ))}
            </div>
            <div className="row">
              <button className="secondary" onClick={() => startEdit(p)}>Edit</button>
              <button className="danger" onClick={() => remove(p._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}