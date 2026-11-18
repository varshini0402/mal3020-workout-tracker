import { useEffect, useState } from 'react';
import { request } from '../api';
import { Dumbbell, Waves } from './Icons';

const emptyForm = {
  type: 'gym', durationMinutes: '', notes: '',
  exName: '', sets: '', reps: '', weightKg: '',
  laps: '', distanceMeters: '', stroke: 'freestyle'
};

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

export default function MemberDashboard({ token, left }) {
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;
    request('/workouts', { token })
      .then((data) => { if (!cancelled) setWorkouts(data); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [token, refresh]);

  const reload = () => setRefresh((n) => n + 1);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const buildBody = () => {
    const body = { type: form.type, durationMinutes: Number(form.durationMinutes), notes: form.notes };
    if (form.type === 'gym' && form.exName) {
      body.exercises = [{
        name: form.exName,
        sets: Number(form.sets),
        reps: Number(form.reps),
        weightKg: Number(form.weightKg)
      }];
    }
    if (form.type === 'swim') {
      body.swim = {
        laps: Number(form.laps),
        distanceMeters: Number(form.distanceMeters),
        stroke: form.stroke
      };
    }
    return body;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await request(`/workouts/${editingId}`, { method: 'PUT', token, body: buildBody() });
      } else {
        await request('/workouts', { method: 'POST', token, body: buildBody() });
      }
      setForm(emptyForm);
      setEditingId(null);
      reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (w) => {
    setEditingId(w._id);
    setForm({
      type: w.type,
      durationMinutes: w.durationMinutes,
      notes: w.notes || '',
      exName: w.exercises?.[0]?.name || '',
      sets: w.exercises?.[0]?.sets || '',
      reps: w.exercises?.[0]?.reps || '',
      weightKg: w.exercises?.[0]?.weightKg || '',
      laps: w.swim?.laps || '',
      distanceMeters: w.swim?.distanceMeters || '',
      stroke: w.swim?.stroke || 'freestyle'
    });
  };

  const cancelEdit = () => { setEditingId(null); setForm(emptyForm); };

  const remove = async (id) => {
    try {
      await request(`/workouts/${id}`, { method: 'DELETE', token });
      reload();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="member-grid">
        <div>{left}</div>

        <div className="card">
          <h2>{editingId ? 'Edit workout' : 'Log a workout'}</h2>
          <form className="stack" onSubmit={submit}>
            <div className="field-grid g2">
              <label className="field">Workout type
                <select name="type" value={form.type} onChange={update}>
                  <option value="gym">Gym</option>
                  <option value="swim">Swim</option>
                </select>
              </label>
              <label className="field">Duration (min)
                <input name="durationMinutes" type="number" min="1" value={form.durationMinutes} onChange={update} required />
              </label>
            </div>

            {form.type === 'gym' && (
              <>
                <label className="field">Exercise
                  <input name="exName" placeholder="Squats" value={form.exName} onChange={update} />
                </label>
                <div className="field-grid g3">
                  <label className="field">Sets
                    <input name="sets" type="number" value={form.sets} onChange={update} />
                  </label>
                  <label className="field">Reps
                    <input name="reps" type="number" value={form.reps} onChange={update} />
                  </label>
                  <label className="field">Weight (kg)
                    <input name="weightKg" type="number" value={form.weightKg} onChange={update} />
                  </label>
                </div>
              </>
            )}

            {form.type === 'swim' && (
              <div className="field-grid g3">
                <label className="field">Laps
                  <input name="laps" type="number" value={form.laps} onChange={update} />
                </label>
                <label className="field">Distance (m)
                  <input name="distanceMeters" type="number" value={form.distanceMeters} onChange={update} />
                </label>
                <label className="field">Stroke
                  <select name="stroke" value={form.stroke} onChange={update}>
                    <option value="freestyle">Freestyle</option>
                    <option value="backstroke">Backstroke</option>
                    <option value="breaststroke">Breaststroke</option>
                    <option value="butterfly">Butterfly</option>
                  </select>
                </label>
              </div>
            )}

            <label className="field">Notes (optional)
              <textarea name="notes" placeholder="Felt strong today." value={form.notes} onChange={update} />
            </label>
            {error && <p className="error">{error}</p>}
            <div className="row">
              <button type="submit" className="add-btn">{editingId ? 'Save changes' : 'Add workout'}</button>
              {editingId && <button type="button" className="secondary" onClick={cancelEdit}>Cancel</button>}
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <h2>My workouts</h2>
        {workouts.length === 0 && <p>No workouts yet. Log your first one above.</p>}
        {workouts.map((w, index) => (
          <div className="wk-row" key={w._id}>
            <div className="wk-num">{index + 1}</div>
            <div className={`wk-tile ${w.type}`}>
              {w.type === 'gym' ? <Dumbbell size={22} color="#0b1a2b" /> : <Waves size={22} color="#0b1a2b" />}
              {w.type}
            </div>
            <div className="wk-info">
              <div className="wk-meta">{w.durationMinutes} min · {fmtDate(w.date)}</div>
              <div className="wk-main">{summary(w)}</div>
              {w.notes && <div className="detail">{w.notes}</div>}
            </div>
            <div className="row">
              <button className="secondary" onClick={() => startEdit(w)}>Edit</button>
              <button className="danger" onClick={() => remove(w._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}