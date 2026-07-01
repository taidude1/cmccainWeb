import { useState, useEffect } from 'react';
import PixelBlast           from './components/PixelBlast.jsx';
import Login                from './components/Login.jsx';
import Clock                from './components/Clock.jsx';
import TradingChart         from './components/TradingChart.jsx';
import StatsPanel           from './components/StatsPanel.jsx';
import UserProgressSection  from './components/UserProgressSection.jsx';
import CommitCalendar       from './components/CommitCalendar.jsx';
import PerformanceChart     from './components/PerformanceChart.jsx';
import ProjectGallery       from './components/ProjectGallery.jsx';
// Dashboard components
import UserDashboard        from './components/UserDashboard.jsx';
import AdminDashboard       from './components/AdminDashboard.jsx';

import {
  fetchAlgorithms, fetchGoals, fetchCompetitorGoals, fetchResearch,
  fetchPunishments, fetchSettings, fetchProjects, fetchStats, updateSettings
} from './api.js';

export default function App() {
  const [token,    setToken]    = useState(() => localStorage.getItem('ct_token'));
  const [username, setUsername] = useState(() => localStorage.getItem('ct_user'));
  const [role,     setRole]     = useState(() => localStorage.getItem('ct_role'));
  const [showLogin,  setShowLogin]  = useState(false);
  const [statsUser,  setStatsUser]  = useState('connor');

  const [algorithms,      setAlgorithms]      = useState(null);
  const [research,        setResearch]        = useState(null);
  const [goals,           setGoals]           = useState([]);
  const [competitorGoals, setCompetitorGoals] = useState([]);
  const [punishments,     setPunishments]     = useState([]);
  const [settings,        setSettings]        = useState({ weeklyContext: '', barLabels: {} });
  const [projects,        setProjects]        = useState([]);
  const [stats,           setStats]           = useState(null);

  function handleLogin(tok, user, r) {
    setToken(tok); setUsername(user); setRole(r);
    localStorage.setItem('ct_token', tok);
    localStorage.setItem('ct_user',  user);
    localStorage.setItem('ct_role',  r);
    setShowLogin(false);
  }
  function handleLogout() {
    setToken(null); setUsername(null); setRole(null);
    ['ct_token', 'ct_user', 'ct_role'].forEach(k => localStorage.removeItem(k));
  }

  useEffect(() => {
    async function load() {
      const [alg, res, g, cg, p, s, proj, st] = await Promise.all([
        fetchAlgorithms(), fetchResearch(), fetchGoals(), fetchCompetitorGoals(),
        fetchPunishments(), fetchSettings(), fetchProjects(), fetchStats(),
      ]);
      setAlgorithms(alg); setResearch(res); setGoals(g); setCompetitorGoals(cg);
      setPunishments(p); setSettings(s); setProjects(proj); setStats(st);
    }
    load();
    const timer = setInterval(async () => {
      const [alg, st] = await Promise.all([fetchAlgorithms(), fetchStats()]);
      setAlgorithms(alg); setStats(st);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const isAdmin  = role === 'admin';
  const isConnor = role === 'connor';
  const isJack   = role === 'challenge';

  const connorGoals = goals.filter(g => g.owner === 'connor');
  const jackGoals   = goals.filter(g => g.owner === 'jack');

  // ── Logged-in user dashboards ──────────────────────────────────
  if (token && (isAdmin || isConnor || isJack)) {
    return (
      <UserDashboard
        username={username}
        role={role}
        token={token}
        allGoals={goals}
        setAllGoals={setGoals}
        research={research}
        setResearch={setResearch}
        algorithms={algorithms}
        stats={stats}
        onLogout={handleLogout}
        adminPanel={isAdmin ? (
          <AdminDashboard
            algorithms={algorithms}
            connorGoals={connorGoals}
            jackGoals={jackGoals}
            allGoals={goals}
            setAllGoals={setGoals}
            competitorGoals={competitorGoals}
            setCompetitorGoals={setCompetitorGoals}
            punishments={punishments}
            setPunishments={setPunishments}
            settings={settings}
            setSettings={setSettings}
            token={token}
            role={role}
          />
        ) : null}
      />
    );
  }

  // ── Public / viewer view ───────────────────────────────────────
  const barLabels = settings.barLabels || {};

  const recentConnor = [...connorGoals]
    .filter(g => g.selfProgress >= 100)
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
    .slice(0, 2);
  const recentJack = [...jackGoals]
    .filter(g => g.selfProgress >= 100)
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
    .slice(0, 2);

  const connorAvg = connorGoals.length
    ? Math.round(connorGoals.reduce((s, g) => s + g.selfProgress, 0) / connorGoals.length) : 0;
  const algAvg = algorithms
    ? Math.round((algorithms.finance + algorithms.cs + algorithms.engineering) / 3) : 0;

  async function handleLabelSave(key, newLabel) {
    const updated = await updateSettings(token, { barLabels: { ...barLabels, [key]: newLabel } });
    setSettings(updated);
  }

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const activeCommitData = statsUser === 'jack' ? stats?.commitDataJack : stats?.commitDataConnor;

  return (
    <>
      <PixelBlast />

      <div className="app-wrapper">
        <header className="vienna-header">
          <div className="vienna-title-block">
            <h1 className="vienna-title">Project Vienna</h1>
            <span className="vienna-date">{today}</span>
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
          <Clock />

          <div className="vienna-top">
            <div className="vienna-chart-card">
              <div className="section-heading">Cumulative Progress</div>
              <TradingChart chartData={stats?.chartData} />
            </div>
            <StatsPanel stats={stats} />
          </div>

          {research && (
            <>
              <UserProgressSection
                userLabel="Jack"
                barA={research.jack}
                barB={research.overall}
                barAKey="jack"
                barBKey="overall"
                barAColor="#089981"
                barBColor="#26a69a"
                recentGoals={recentJack}
                canEdit={false}
                token={token}
                role={role}
                onUpdate={setResearch}
                onLabelSave={handleLabelSave}
              />
              <UserProgressSection
                userLabel="Connor"
                barA={{ label: barLabels.connorBarA || 'Competitor Avg (Finance / CS / Eng)', value: algAvg }}
                barB={{ label: barLabels.connorBarB || "Connor's Goal Avg", value: connorAvg }}
                barAKey={null}
                barBKey={null}
                barASettingsKey="connorBarA"
                barBSettingsKey="connorBarB"
                barAColor="#CC2200"
                barBColor="#E87030"
                recentGoals={recentConnor}
                canEdit={false}
                token={token}
                role={role}
                onUpdate={setResearch}
                onLabelSave={handleLabelSave}
              />
            </>
          )}

          <div className="vienna-bottom">
            <div className="vienna-left-stats">
              <div className="vienna-card">
                <div className="vienna-card-header">
                  <div className="section-heading" style={{ marginBottom: 0 }}>Goal Activity</div>
                  <div className="user-toggle">
                    <button
                      className={`toggle-btn${statsUser === 'connor' ? ' active' : ''}`}
                      onClick={() => setStatsUser('connor')}
                    >Connor</button>
                    <button
                      className={`toggle-btn${statsUser === 'jack' ? ' active' : ''}`}
                      onClick={() => setStatsUser('jack')}
                    >Jack</button>
                  </div>
                </div>
                <CommitCalendar commitData={activeCommitData} />
              </div>
              <div className="vienna-card" style={{ marginTop: '1rem' }}>
                <div className="vienna-card-header">
                  <div className="section-heading" style={{ marginBottom: 0 }}>
                    Performance — {statsUser === 'jack' ? 'Jack' : 'Connor'}
                  </div>
                </div>
                <PerformanceChart commitData={activeCommitData} />
              </div>
            </div>
            <div className="vienna-card vienna-projects-card">
              <ProjectGallery
                projects={projects}
                setProjects={setProjects}
                token={token}
                role={role}
              />
            </div>
          </div>
        </main>
      </div>

      <footer className="vienna-footer">
        <div className="footer-inner">
          <span className="footer-brand">Project Vienna</span>
          <span className="footer-links">
            <a href="https://cmccain.me" className="footer-link">cmccain.me</a>
          </span>
        </div>
      </footer>
    </>
  );
}
