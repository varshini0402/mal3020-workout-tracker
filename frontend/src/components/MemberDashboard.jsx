import { useEffect, useState } from 'react';
import { request } from '../api';

const emptyForm = {
  type: 'gym', durationMinutes: '', notes: '',
  exName: '', sets: '', reps: '', weightKg: '',
  laps: '', distanceMeters: '', stroke: 'freestyle'
};

export default function MemberDashboard({ token }) {
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  // Load workouts on first render and whenever "refresh" changes
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
      <div className="card">
        <h2>{editingId ? 'Edit workout' : 'Log a workout'}</h2>
        <form onSubmit={submit}>
          <select name="type" value={form.type} onChange={update}>
            <option value="gym">Gym</option>
            <option value="swim">Swim</option>
          </select>
          <input name="durationMinutes" type="number" min="1" placeholder="Duration (minutes)"
            value={form.durationMinutes} onChange={update} required />

          {form.type === 'gym' && (
            <>
              <input name="exName" placeholder="Exercise (e.g. Squats)" value={form.exName} onChange={update} />
              <input name="sets" type="number" placeholder="Sets" value={form.sets} onChange={update} />
              <input name="reps" type="number" placeholder="Reps" value={form.reps} onChange={update} />
              <input name="weightKg" type="number" placeholder="Weight (kg)" value={form.weightKg} onChange={update} />
            </>
          )}

          {form.type === 'swim' && (
            <>
              <input name="laps" type="number" placeholder="Laps" value={form.laps} onChange={update} />
              <input name="distanceMeters" type="number" placeholder="Distance (m)" value={form.distanceMeters} onChange={update} />
              <select name="stroke" value={form.stroke} onChange={update}>
                <option value="freestyle">Freestyle</option>
                <option value="backstroke">Backstroke</option>
                <option value="breaststroke">Breaststroke</option>
                <option value="butterfly">Butterfly</option>
              </select>
            </>
          )}

          <input name="notes" placeholder="Notes" value={form.notes} onChange={update} />
          {error && <p className="error">{error}</p>}
          <div className="row">
            <button type="submit">{editingId ? 'Save changes' : 'Add workout'}</button>
            {editingId && <button type="button" className="secondary" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>My workouts</h2>
        {workouts.length === 0 && <p>No workouts yet. Log your first one above.</p>}
        {workouts.map((w) => (
          <div className="workout" key={w._id}>
            <div>
              <strong>{w.type === 'gym' ? 'Gym' : 'Swim'}</strong> - {w.durationMinutes} min
              <span className="date"> ({new Date(w.date).toLocaleDateString()})</span>
              {w.exercises?.map((x) => (
                <div key={x._id} className="detail">{x.name}: {x.sets} x {x.reps} @ {x.weightKg} kg</div>
              ))}
              {w.swim?.laps != null && (
                <div className="detail">{w.swim.laps} laps, {w.swim.distanceMeters} m, {w.swim.stroke}</div>
              )}
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