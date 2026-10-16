import { useState } from 'react';
import { request } from '../api';

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

  return (
    <div className="card auth">
      <h1>Workout Tracker</h1>
      <h2>{mode === 'login' ? 'Log in' : 'Create account'}</h2>
      <form onSubmit={submit}>
        {mode === 'register' && (
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {mode === 'register' && (
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="member">Member</option>
            <option value="trainer">Trainer</option>
          </select>
        )}
        {error && <p className="error">{error}</p>}
        <button type="submit">{mode === 'login' ? 'Log in' : 'Register'}</button>
      </form>
      <p className="switch">
        {mode === 'login' ? 'No account yet? ' : 'Already registered? '}
        <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
          {mode === 'login' ? 'Register' : 'Log in'}
        </a>
      </p>
    </div>
  );
}