import { useState } from 'react';
import CommitCalendar  from './CommitCalendar.jsx';
import OngoingGoals    from './OngoingGoals.jsx';
import GoalSubmission  from './GoalSubmission.jsx';

function SimpleBar({ label, value, color }) {
  return (
    <div className="vienna-bar-row">
      <div className="vienna-bar-header">
        <span className="vienna-bar-label">{label}</span>
        <span className="vienna-bar-pct" style={{ color }}>{value}%</span>
      </div>
      <div className="vienna-track">
        <div className="vienna-fill" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
      </div>
    </div>
  );
}

export default function UserDashboard({
  username, role, token,
  allGoals, setAllGoals,
  research,
  algorithms,
  stats,
  onLogout,
  adminPanel = null,
}) {
  const [showAdmin, setShowAdmin] = useState(false);

  const isConnor   = role === 'admin' || role === 'connor';
  const showAdminToggle = role === 'admin';

  const myGoals = allGoals.filter(g => isConnor ? g.owner === 'connor' : g.owner === 'jack');
  const myStats = isConnor ? stats?.connorStats : stats?.jackStats;
  const myCommitData = isConnor ? stats?.commitDataConnor : stats?.commitDataJack;

  const myResearch    = research?.[isConnor ? 'connor' : 'jack'];
  const otherResearch = research?.[isConnor ? 'jack' : 'connor'];

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="user-dashboard">
      <div className="user-dash-wrapper">

        {/* ── Header ── */}
        <header className="user-dash-header">
          <h1 className="user-dash-name">{username}</h1>
          <div className="user-dash-header-right">
            <span className="user-dash-date">{today}</span>
            <div className="auth-controls">
              {showAdminToggle && (
                <button className="btn-ghost btn-sm" onClick={() => setShowAdmin(a => !a)}>
                  {showAdmin ? 'Close Admin' : 'Admin Panel'}
                </button>
              )}
              <button className="btn-ghost btn-sm" onClick={onLogout}>Log out</button>
            </div>
          </div>
        </header>

        {/* ── Connor: competitor algorithm bars ── */}
        {isConnor && algorithms && (
          <div className="algo-bars-section">
            {[
              { key: 'finance',     label: 'Finance' },
              { key: 'cs',          label: 'Computer Science' },
              { key: 'engineering', label: 'Engineering' },
            ].map(({ key, label }) => (
              <div key={key} className="algo-bar-card">
                <div className="algo-bar-name">{label}</div>
                <div className="algo-bar-value">{algorithms[key] ?? 0}%</div>
                <div className="vienna-track">
                  <div
                    className="vienna-fill"
                    style={{ width: `${algorithms[key] ?? 0}%`, background: 'var(--navy)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Progress bars (dashed section) ── */}
        {research && (
          <div className="dash-bars-section">
            <SimpleBar
              label={myResearch?.label    || (isConnor ? "Connor's Progress" : "Jack's Progress")}
              value={myResearch?.value    ?? 0}
              color={isConnor ? 'var(--crimson)' : 'var(--teal)'}
            />
            <SimpleBar
              label={otherResearch?.label || (isConnor ? "Jack's Progress" : "Connor's Progress")}
              value={otherResearch?.value ?? 0}
              color={isConnor ? 'var(--gold)' : 'var(--crimson)'}
            />
          </div>
        )}

        {/* ── Main grid: left (calendar + stats) | right (goals) ── */}
        <div className="dash-main-grid">
          <div className="dash-left">
            {/* Calendar */}
            <div className="vienna-card">
              <div className="section-heading">Goal Activity</div>
              <CommitCalendar commitData={myCommitData} />
            </div>

            {/* Stats */}
            <div className="dash-stats-card">
              <div className="section-heading">Overview</div>
              <div className="stat-row">
                <span className="stat-row-label">Current Streak</span>
                <span className="stat-row-value">{myStats?.streak ?? 0} day{myStats?.streak !== 1 ? 's' : ''}</span>
              </div>
              <div className="stat-row">
                <span className="stat-row-label">Goals Complete</span>
                <span className="stat-row-value">
                  {myStats?.goalsCompleted ?? 0}
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontFamily: 'Inter' }}>
                    /{myStats?.goalsTotal ?? 0}
                  </span>
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-row-label">Total Points</span>
                <span className="stat-row-value gold">{myStats?.points ?? 0}</span>
              </div>
              <div className="stat-row">
                <span className="stat-row-label">This Week</span>
                <span className="stat-row-value teal">{myStats?.weeklyCompleted ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Ongoing goals */}
          <div className="dash-right">
            <OngoingGoals
              myGoals={myGoals}
              allGoals={allGoals}
              setAllGoals={setAllGoals}
              token={token}
              role={role}
            />
          </div>
        </div>

        {/* ── Goal submission ── */}
        <GoalSubmission
          myGoals={myGoals}
          allGoals={allGoals}
          setAllGoals={setAllGoals}
          token={token}
        />

        {/* ── Admin panel (admin role only) ── */}
        {showAdminToggle && showAdmin && adminPanel}

      </div>
    </div>
  );
}
