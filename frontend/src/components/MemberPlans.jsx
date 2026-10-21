import { useEffect, useState } from 'react';
import { request } from '../api';

export default function MemberPlans({ token }) {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    request('/plans', { token }).then(setPlans).catch(() => {});
  }, [token]);

  return (
    <div className="card">
      <h2>My plans from my trainer</h2>
      {plans.length === 0 && <p>No plans yet. Your trainer will add them here.</p>}
      {plans.map((p) => (
        <div className="workout" key={p._id}>
          <div>
            <strong>{p.title}</strong>
            {p.items.map((i) => (
              <div key={i._id} className="detail">
                {i.dayOfWeek}: {i.exercise} ({i.sets} x {i.reps})
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}