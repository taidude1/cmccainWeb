import { useState, useEffect } from 'react';
import Login            from './components/Login.jsx';
import ResearchSection  from './components/ResearchSection.jsx';
import ProgressBars     from './components/ProgressBars.jsx';
import CompetitorSection from './components/CompetitorSection.jsx';
import GoalsList        from './components/GoalsList.jsx';
import PunishmentsSection from './components/PunishmentsSection.jsx';
import {
  fetchAlgorithms, fetchGoals, fetchCompetitorGoals,
  fetchResearch, fetchPunishments, fetchSettings
} from './api.js';

export default function App() {
  const [token,    setToken]    = useState(() => localStorage.getItem('ct_token'));
  const [username, setUsername] = useState(() => localStorage.getItem('ct_user'));
  const [role,     setRole]     = useState(() => localStorage.getItem('ct_role'));
  const [showLogin, setShowLogin] = useState(false);

  const [algorithms,      setAlgorithms]      = useState(null);
  const [research,        setResearch]        = useState(null);
  const [goals,           setGoals]           = useState([]);
  const [competitorGoals, setCompetitorGoals] = useState([]);
  const [punishments,     setPunishments]     = useState([]);
  const [settings,        setSettings]        = useState({ weeklyContext: '' });

  function handleLogin(tok, user, r) {
    setToken(tok); setUsername(user); setRole(r);
    localStorage.setItem('ct_token', tok);
    localStorage.setItem('ct_user', user);
    localStorage.setItem('ct_role', r);
    setShowLogin(false);
  }

  function handleLogout() {
    setToken(null); setUsername(null); setRole(null);
    localStorage.removeItem('ct_token');
    localStorage.removeItem('ct_user');
    localStorage.removeItem('ct_role');
  }

  useEffect(() => {
    async function load() {
      const [alg, res, g, cg, p, s] = await Promise.all([
        fetchAlgorithms(), fetchResearch(), fetchGoals(),
        fetchCompetitorGoals(), fetchPunishments(), fetchSettings()
      ]);
      setAlgorithms(alg); setResearch(res); setGoals(g);
      setCompetitorGoals(cg); setPunishments(p); setSettings(s);
    }
    load();
    const timer = setInterval(async () => {
      const [alg, cg] = await Promise.all([fetchAlgorithms(), fetchCompetitorGoals()]);
      setAlgorithms(alg); setCompetitorGoals(cg);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const isAdmin    = role === 'admin';
  const isChallenge = role === 'challenge';
  const isViewer   = role === 'viewer';

  const connorGoals = goals.filter(g => g.owner === 'connor');
  const jackGoals   = goals.filter(g => g.owner === 'jack');

  const connorAvg = connorGoals.length
    ? Math.round(connorGoals.reduce((s, g) => s + g.selfProgress, 0) / connorGoals.length) : 0;

  // Flag punishments that need Connor's attention
  const executionAlerts = punishments.filter(p => p.executePending && p.status !== 'completed');

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <span className="header-title">Challenge Tracker</span>
          {isAdmin && executionAlerts.length > 0 && (
            <span className="alert-badge">{executionAlerts.length} execution{executionAlerts.length > 1 ? 's' : ''} called</span>
          )}
        </div>
        <div className="auth-controls">
          {token ? (
            <>
              <span className="username-chip">{username}</span>
              <button onClick={handleLogout} className="btn-ghost">Log out</button>
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

      <main className="app-main">
        {/* ── Research (everyone) ── */}
        {research && (
          <ResearchSection
            research={research}
            setResearch={setResearch}
            token={token}
            role={role}
          />
        )}

        {/* ── Competition bars (admin only) ── */}
        {isAdmin && algorithms && (
          <ProgressBars algorithms={algorithms} userProgress={connorAvg} />
        )}

        {/* ── Competitor goals (admin only) ── */}
        {isAdmin && (
          <CompetitorSection
            competitorGoals={competitorGoals}
            setCompetitorGoals={setCompetitorGoals}
            algorithms={algorithms}
            token={token}
            settings={settings}
            setSettings={setSettings}
          />
        )}

        {/* ── Goals grid ── */}
        <div className="goals-grid">
          <GoalsList
            title="Connor's Goals"
            owner="connor"
            goals={connorGoals}
            setGoals={setGoals}
            allGoals={goals}
            token={token}
            role={role}
            canEdit={isAdmin}
          />
          <GoalsList
            title="Jack's Goals"
            owner="jack"
            goals={jackGoals}
            setGoals={setGoals}
            allGoals={goals}
            token={token}
            role={role}
            canEdit={isChallenge}
          />
        </div>

        {/* ── Punishments (everyone) ── */}
        <PunishmentsSection
          punishments={punishments}
          setPunishments={setPunishments}
          token={token}
          role={role}
        />
      </main>
    </div>
  );
}
