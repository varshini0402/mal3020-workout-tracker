import { useEffect, useState } from 'react';
import { request } from '../api';
import { Trash } from './Icons';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const emptyItem = { exercise: '', sets: '', reps: '', dayOfWeek: 'Monday' };

export default function PlanManager({ token, members }) {
  const [plans, setPlans] = useState([]);
  const [memberId, setMemberId] = useState('');
  const [title, setTitle] = useState('');
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;
    request('/plans', { token })
      .then((data) => { if (!cancelled) setPlans(data); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [token, refresh]);

  const reload = () => setRefresh((n) => n + 1);
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
      reload();
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
      reload();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>{editingId ? 'Edit plan' : 'Create a plan'}</h2>
        <form className="stack" onSubmit={submit}>
          <div className="field-grid g2">
            <label className="field">Member
              <select value={memberId} onChange={(e) => setMemberId(e.target.value)} disabled={!!editingId}>
                <option value="">Choose a member...</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </label>
            <label className="field">Plan title
              <input placeholder="Strength & Swim" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
          </div>

          <div className="plan-cols head">
            <span>Exercise</span><span>Sets</span><span>Reps</span><span>Day</span><span />
          </div>
          {items.map((it, i) => (
            <div className="plan-cols" key={i}>
              <input placeholder="Squats" value={it.exercise} onChange={(e) => updateItem(i, 'exercise', e.target.value)} />
              <input type="number" value={it.sets} onChange={(e) => updateItem(i, 'sets', e.target.value)} />
              <input type="number" value={it.reps} onChange={(e) => updateItem(i, 'reps', e.target.value)} />
              <select value={it.dayOfWeek} onChange={(e) => updateItem(i, 'dayOfWeek', e.target.value)}>
                {days.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {items.length > 1
                ? <button type="button" className="icon-btn" onClick={() => removeItem(i)} aria-label="Remove exercise"><Trash /></button>
                : <span />}
            </div>
          ))}

          {error && <p className="error">{error}</p>}
          <div className="form-actions">
            <button type="button" className="secondary" onClick={addItem}>+ Add exercise</button>
            <div className="row">
              {editingId && <button type="button" className="secondary" onClick={reset}>Cancel</button>}
              <button type="submit" className="create-btn">{editingId ? 'Save changes' : 'Create plan'}</button>
            </div>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Plans I created</h2>
        {plans.length === 0 && <p>No plans yet.</p>}
        {plans.map((p) => (
          <div className="plan-row" key={p._id}>
            <div className="plan-title">
              <strong>{p.title}</strong>
              <span>{memberName(p.memberId)}</span>
            </div>
            <div className="plan-items">
              {p.items.map((i) => (
                <div key={i._id}>{i.dayOfWeek}: {i.exercise} ({i.sets} × {i.reps})</div>
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