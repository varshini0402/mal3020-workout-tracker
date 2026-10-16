import { useState } from 'react';
import AuthForm from './components/AuthForm';
import MemberDashboard from './components/MemberDashboard';
import './App.css';

export default function App() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('session') || 'null'));

  const login = (s) => {
    localStorage.setItem('session', JSON.stringify(s));
    setSession(s);
  };

  const logout = () => {
    localStorage.removeItem('session');
    setSession(null);
  };

  if (!session) return <AuthForm onLogin={login} />;

  return (
    <div className="container">
      <header>
        <h1>Workout Tracker</h1>
        <div>
          <span>{session.user.name} ({session.user.role})</span>
          <button className="secondary" onClick={logout}>Log out</button>
        </div>
      </header>

      {session.user.role === 'member' && <MemberDashboard token={session.token} />}
      {session.user.role !== 'member' && <div className="card"><p>Trainer dashboard coming next.</p></div>}
    </div>
  );
}