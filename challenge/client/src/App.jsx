import { useState, useEffect } from 'react';
import Login                from './components/Login.jsx';
import Clock                from './components/Clock.jsx';
import TradingChart         from './components/TradingChart.jsx';
import StatsPanel           from './components/StatsPanel.jsx';
import UserProgressSection  from './components/UserProgressSection.jsx';
import CommitCalendar       from './components/CommitCalendar.jsx';
import PerformanceChart     from './components/PerformanceChart.jsx';
import ProjectGallery       from './components/ProjectGallery.jsx';
// Admin-panel components
import ResearchSection      from './components/ResearchSection.jsx';
import ProgressBars         from './components/ProgressBars.jsx';
import CompetitorSection    from './components/CompetitorSection.jsx';
import GoalsList            from './components/GoalsList.jsx';
import PunishmentsSection   from './components/PunishmentsSection.jsx';

import {
  fetchAlgorithms, fetchGoals, fetchCompetitorGoals, fetchResearch,
  fetchPunishments, fetchSettings, fetchProjects, fetchStats
} from './api.js';

export default function App() {
  const [token,    setToken]    = useState(() => localStorage.getItem('ct_token'));
  const [username, setUsername] = useState(() => localStorage.getItem('ct_user'));
  const [role,     setRole]     = useState(() => localStorage.getItem('ct_role'));
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const [algorithms,      setAlgorithms]      = useState(null);
  const [research,        setResearch]        = useState(null);
  const [goals,           setGoals]           = useState([]);
  const [competitorGoals, setCompetitorGoals] = useState([]);
  const [punishments,     setPunishments]     = useState([]);
  const [settings,        setSettings]        = useState({ weeklyContext: '' });
  const [projects,        setProjects]        = useState([]);
  const [stats,           setStats]           = useState(null);

  function handleLogin(tok, user, r) {
    setToken(tok); setUsername(user); setRole(r);
    localStorage.setItem('ct_token', tok);
    localStorage.setItem('ct_user', user);
    localStorage.setItem('ct_role', r);
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

  const isAdmin    = role === 'admin';
  const isChallenge = role === 'challenge';
  const connorGoals = goals.filter(g => g.owner === 'connor');
  const jackGoals   = goals.filter(g => g.owner === 'jack');

  // Most recently completed goals per user (sorted by completedAt desc)
  const recentConnor = [...connorGoals]
    .filter(g => g.selfProgress >= 100)
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
    .slice(0, 2);
  const recentJack = [...jackGoals]
    .filter(g => g.selfProgress >= 100)
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
    .slice(0, 2);

  // Connor vs algorithm average bar
  const connorAvg = connorGoals.length
    ? Math.round(connorGoals.reduce((s, g) => s + g.selfProgress, 0) / connorGoals.length) : 0;
  const algAvg = algorithms
    ? Math.round((algorithms.finance + algorithms.cs + algorithms.engineering) / 3) : 0;

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="vienna-header">
        <div className="vienna-title-block">
          <h1 className="vienna-title">Project Vienna</h1>
          <span className="vienna-date">{today}</span>
        </div>
        <div className="auth-controls">
          {token ? (
            <>
              <span className="username-chip">{username}</span>
              {isAdmin && (
                <button className="btn-ghost" onClick={() => setShowAdmin(a => !a)}>
                  {showAdmin ? 'Hide Panel' : 'Admin Panel'}
                </button>
              )}
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
        {/* ── Top: Chart + Stats ── */}
        <div className="vienna-top">
          <div className="vienna-chart-card">
            <div className="section-heading">Cumulative Progress</div>
            <TradingChart chartData={stats?.chartData} />
          </div>
          <StatsPanel stats={stats} />
        </div>

        {/* ── Clock ── */}
        <Clock />

        {/* ── User sections (dashed) ── */}
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
              canEdit={isAdmin || isChallenge}
              token={token}
              research={research}
              setResearch={setResearch}
            />
            <UserProgressSection
              userLabel="Connor"
              barA={{ label: 'Competitor Avg (Finance/CS/Eng)', value: algAvg }}
              barB={{ label: "Connor's Goal Avg", value: connorAvg }}
              barAKey={null}
              barBKey={null}
              barAColor="#2962ff"
              barBColor="#f23645"
              recentGoals={recentConnor}
              canEdit={false}
              token={token}
              research={research}
              setResearch={setResearch}
            />
          </>
        )}

        {/* ── Bottom: Commit calendar + Perf chart | Projects ── */}
        <div className="vienna-bottom">
          <div className="vienna-left-stats">
            <div className="vienna-card">
              <div className="section-heading">Goal Activity — Connor</div>
              <CommitCalendar commitData={stats?.commitData} />
            </div>
            <div className="vienna-card" style={{ marginTop: '1rem' }}>
              <div className="section-heading">Performance — Connor</div>
              <PerformanceChart commitData={stats?.commitData} />
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

        {/* ── Footer ── */}
        <footer className="vienna-footer">
          <span>Project Vienna</span>
          <span>
            <a href="https://cmccain.me" className="footer-link">cmccain.me</a>
          </span>
        </footer>

        {/* ── Admin panel (toggle) ── */}
        {isAdmin && showAdmin && (
          <div className="admin-panel">
            <div className="admin-panel-header">
              <div className="section-heading" style={{ marginBottom: 0 }}>Admin Panel</div>
            </div>
            {research && (
              <ResearchSection research={research} setResearch={setResearch} token={token} role={role} />
            )}
            {algorithms && (
              <ProgressBars algorithms={algorithms} userProgress={connorAvg} />
            )}
            <CompetitorSection
              competitorGoals={competitorGoals}
              setCompetitorGoals={setCompetitorGoals}
              algorithms={algorithms}
              token={token}
              settings={settings}
              setSettings={setSettings}
            />
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
            <PunishmentsSection
              punishments={punishments}
              setPunishments={setPunishments}
              token={token}
              role={role}
            />
          </div>
        )}

        {/* Non-admin users still see goals + punishments */}
        {!isAdmin && (
          <>
            <div className="goals-grid" style={{ marginTop: '1.5rem' }}>
              <GoalsList
                title="Connor's Goals"
                owner="connor"
                goals={connorGoals}
                setGoals={setGoals}
                allGoals={goals}
                token={token}
                role={role}
                canEdit={false}
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
            <PunishmentsSection
              punishments={punishments}
              setPunishments={setPunishments}
              token={token}
              role={role}
            />
          </>
        )}
      </main>
    </div>
  );
}
