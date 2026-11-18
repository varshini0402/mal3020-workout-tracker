import { useEffect, useState } from 'react';
import { request } from '../api';
import { Dumbbell, Waves } from './Icons';

export default function MemberPlans({ token }) {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    request('/plans', { token }).then(setPlans).catch(() => {});
  }, [token]);

  return (
    <div className="card dark plan-card">
      <div className="eyebrow">My plans from my trainer</div>
      {plans.length === 0 && <p>No plans yet. Your trainer will add them here.</p>}
      {plans.map((p) => (
        <div className="plan-block" key={p._id}>
          <h3>{p.title}</h3>
          {p.items.map((i) => (
            <div className="plan-line" key={i._id}>
              <strong>{i.dayOfWeek}:</strong>
              <span>{i.exercise} ({i.sets} × {i.reps})</span>
            </div>
          ))}
        </div>
      ))}
      <span className="corner top"><Dumbbell color="#d4f25a" size={30} /></span>
      <span className="corner bottom"><Waves color="#8ee3df" size={34} /></span>
    </div>
  );
}