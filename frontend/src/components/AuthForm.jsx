import { useState } from 'react';
import { request } from '../api';
import Logo from './Logo';

export default function AuthForm({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'register') {
        await request('/auth/register', { method: 'POST', body: { name, email, password, role } });
      }
      const data = await request('/auth/login', { method: 'POST', body: { email, password } });
      onLogin({ token: data.token, user: data.user });
    } catch (err) {
      setError(err.message);
    }
  };

  const lanes = [0, 1, 2, 3, 4, 5];

  return (
    <div className="auth-page">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">LapLift <Logo color="#fff" /></div>
        </div>
      </header>

      <div className="auth-stage">
        <svg className="lanes" viewBox="0 0 560 400">
          {lanes.map((i) => {
            const ys = 20 + i * 14;
            const r1 = 110 - i * 14;
            const r2 = 40 + i * 14;
            return (
              <path
                key={i}
                d={`M-3000 ${ys} H175 A${r1} ${r1} 0 0 1 ${175 + r1} ${ys + r1} V250 A${r2} ${r2} 0 0 0 ${175 + r1 + r2} ${250 + r2} H700`}
              />
            );
          })}
        </svg>
        <div className="dumbbell-lines" />
        <svg className="dumbbell" viewBox="60 0 100 160">
          <rect x="60" y="24" width="14" height="112" rx="3" />
          <rect x="82" y="12" width="14" height="136" rx="3" />
          <rect x="104" y="32" width="14" height="96" rx="3" />
          <rect x="124" y="70" width="36" height="20" />
        </svg>

        <div className="auth-content">
          <div className="auth-brand">
            <div className="brand-lg">LapLift <Logo /></div>
            <p className="tagline">Track every lift and every lap</p>
          </div>

          <div className="card auth">
            <h2>{mode === 'login' ? 'Welcome back.' : 'Start your journey.'}</h2>
            <form onSubmit={submit}>
              {mode === 'register' && (
                <label className="field">Name
                  <input placeholder="Alex Carter" value={name} onChange={(e) => setName(e.target.value)} required />
                </label>
              )}
              <label className="field">Email
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label className="field">Password
                <input type="password" placeholder={mode === 'login' ? '••••••••' : 'Create a password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
              </label>
              {mode === 'register' && (
                <label className="field">Role
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="member">Member</option>
                    <option value="trainer">Trainer</option>
                  </select>
                </label>
              )}
              {error && <p className="error">{error}</p>}
              <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
            </form>
            <p className="switch">
              {mode === 'login' ? 'New to LapLift? ' : 'Already have an account? '}
              <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
                {mode === 'login' ? 'Register' : 'Login'}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}