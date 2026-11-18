import { useState } from 'react';
import AuthForm from './components/AuthForm';
import MemberDashboard from './components/MemberDashboard';
import MemberPlans from './components/MemberPlans';
import TrainerDashboard from './components/TrainerDashboard';
import TrainerPicker from './components/TrainerPicker';
import AdminDashboard from './components/AdminDashboard';
import Logo from './components/Logo';
import './App.css';

const headlines = { member: 'Your training.', trainer: 'Coach with purpose.', admin: 'Keep it moving.' };

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
    <div>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand"><Logo color="#8ee3df" /> LapLift</div>
          <div className="userbox">
            <span>{session.user.name}</span>
            <span className="role-badge">{session.user.role}</span>
            <button className="secondary" onClick={logout}>Log out</button>
          </div>
        </div>
      </header>

      <main className="container">
        <h1 className="hero">{headlines[session.user.role]}</h1>
        {session.user.role === 'member' && (
          <MemberDashboard
            token={session.token}
            left={<><TrainerPicker token={session.token} /><MemberPlans token={session.token} /></>}
          />
        )}
        {session.user.role === 'trainer' && <TrainerDashboard token={session.token} />}
        {session.user.role === 'admin' && (
          <AdminDashboard token={session.token} currentUserId={session.user.id} />
        )}
      </main>
    </div>
  );
}