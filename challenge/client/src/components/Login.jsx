import { useState } from 'react';
import { login } from '../api.js';

export default function Login({ onLogin, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(username, password);
      onLogin(data.token, data.username);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-card">
      <div className="login-header">
        <h2>Log in</h2>
        <button onClick={onClose} className="close-btn" aria-label="Close">×</button>
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </div>
  );
}
