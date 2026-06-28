import { useState, useEffect } from 'react';
import Login from './components/Login.jsx';
import ProgressBars from './components/ProgressBars.jsx';
import CompetitorSection from './components/CompetitorSection.jsx';
import GoalsList from './components/GoalsList.jsx';
import { fetchAlgorithms, fetchGoals, fetchCompetitorGoals } from './api.js';

export default function App() {
  const [token, setToken]   = useState(() => localStorage.getItem('challenge_token'));
  const [username, setUsername] = useState(() => localStorage.getItem('challenge_user'));
  const [showLogin, setShowLogin] = useState(false);
  const [algorithms, setAlgorithms] = useState(null);
  const [goals, setGoals] = useState([]);
  const [competitorGoals, setCompetitorGoals] = useState([]);

  function handleLogin(tok, user) {
    setToken(tok);
    setUsername(user);
    localStorage.setItem('challenge_token', tok);
    localStorage.setItem('challenge_user', user);
    setShowLogin(false);
  }

  function handleLogout() {
    setToken(null);
    setUsername(null);
    localStorage.removeItem('challenge_token');
    localStorage.removeItem('challenge_user');
  }

  useEffect(() => {
    async function load() {
      const [alg, g, cg] = await Promise.all([
        fetchAlgorithms(),
        fetchGoals(),
        fetchCompetitorGoals()
      ]);
      setAlgorithms(alg);
      setGoals(g);
      setCompetitorGoals(cg);
    }
    load();

    // Refresh algorithm bars + competitor progress every minute
    const timer = setInterval(async () => {
      const [alg, cg] = await Promise.all([fetchAlgorithms(), fetchCompetitorGoals()]);
      setAlgorithms(alg);
      setCompetitorGoals(cg);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const userProgress = goals.length
    ? Math.round(goals.reduce((sum, g) => sum + g.selfProgress, 0) / goals.length)
    : 0;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Challenge Tracker</h1>
        <div className="auth-controls">
          {token ? (
            <>
              <span className="username">{username}</span>
              <button onClick={handleLogout} className="btn-secondary">Log out</button>
            </>
          ) : (
            <button onClick={() => setShowLogin(true)} className="btn-primary">Log in</button>
          )}
        </div>
      </header>

      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div onClick={e => e.stopPropagation()}>
            <Login onLogin={handleLogin} onClose={() => setShowLogin(false)} />
          </div>
        </div>
      )}

      <main>
        {algorithms ? (
          <ProgressBars algorithms={algorithms} userProgress={userProgress} />
        ) : (
          <div className="loading">Loading…</div>
        )}

        <CompetitorSection
          competitorGoals={competitorGoals}
          setCompetitorGoals={setCompetitorGoals}
          algorithms={algorithms}
          token={token}
        />

        <GoalsList goals={goals} setGoals={setGoals} token={token} />
      </main>
    </div>
  );
}
