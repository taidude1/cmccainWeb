import { useState } from 'react';
import { updateResearch } from '../api.js';

function ProgressBar({ label, value, color, editable, token, barKey, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const updated = await updateResearch(token, barKey, draft);
      onUpdate(updated);
      setEditing(false);
    } catch { /* ignore */ }
    setSaving(false);
  }

  return (
    <div className="vienna-bar-row">
      <div className="vienna-bar-header">
        <span className="vienna-bar-label">{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="vienna-bar-pct" style={{ color }}>{editing ? Math.round(draft) : value}%</span>
          {editable && !editing && (
            <button className="btn-ghost btn-sm" onClick={() => { setDraft(value); setEditing(true); }}>Edit</button>
          )}
        </div>
      </div>
      <div className="vienna-track">
        <div className="vienna-fill" style={{ width: `${editing ? draft : value}%`, background: color }} />
      </div>
      {editing && (
        <div className="vienna-edit-row">
          <input
            type="range" min="0" max="100"
            value={draft}
            onChange={e => setDraft(Number(e.target.value))}
            style={{ flex: 1, accentColor: color }}
          />
          <button className="btn-sm btn-teal" onClick={save} disabled={saving}>Save</button>
          <button className="btn-sm btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

function RecentGoal({ goal }) {
  if (!goal) return <div className="recent-goal-empty">—</div>;
  const pct = goal.selfProgress;
  return (
    <div className="recent-goal-item">
      <div className="recent-goal-title">{goal.title}</div>
      <div className="recent-goal-bar-row">
        <div className="mini-track" style={{ flex: 1 }}>
          <div className="mini-fill self-fill" style={{ width: `${pct}%` }} />
        </div>
        <span style={{ fontSize: '0.75rem', color: '#6B7A8A', minWidth: 28, textAlign: 'right' }}>{pct}%</span>
      </div>
      {goal.judgeComment && (
        <div className="recent-goal-comment">"{goal.judgeComment}"</div>
      )}
    </div>
  );
}

export default function UserProgressSection({
  userLabel, barA, barB, barAKey, barBKey,
  barAColor, barBColor,
  recentGoals = [], canEdit = false,
  token, research, setResearch,
  isDashed = true,
}) {
  const [g1, g2] = recentGoals;

  return (
    <div className={isDashed ? 'vienna-user-section dashed' : 'vienna-user-section'}>
      <div className="vienna-user-label">{userLabel}</div>
      <div className="vienna-user-inner">
        <div className="vienna-bars-col">
          <ProgressBar
            label={barA.label}
            value={barA.value}
            color={barAColor}
            editable={canEdit}
            token={token}
            barKey={barAKey}
            onUpdate={setResearch}
          />
          <ProgressBar
            label={barB.label}
            value={barB.value}
            color={barBColor}
            editable={canEdit}
            token={token}
            barKey={barBKey}
            onUpdate={setResearch}
          />
        </div>
        <div className="vienna-goals-col">
          <div className="vienna-goals-heading">Recently Completed</div>
          <RecentGoal goal={g1} />
          <RecentGoal goal={g2} />
        </div>
      </div>
    </div>
  );
}
