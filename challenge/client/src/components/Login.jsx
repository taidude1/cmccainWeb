import { useState } from 'react';
import { login } from '../api.js';

export default function Login({ onLogin, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, username: u, role } = await login(username.trim(), password);
      onLogin(token, u, role);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-card">
      <div className="login-header">
        <h2>Log in</h2>
        <button onClick={onClose} className="close-btn" aria-label="Close">&times;</button>
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input
            autoFocus
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Your username"
            autoComplete="username"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>
        {error && <div className="error-msg">{error}</div>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </div>
  );
}
