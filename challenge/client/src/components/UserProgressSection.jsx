import { useState } from 'react';
import { updateResearch, updateSettings } from '../api.js';

function EditableLabel({ label, canEdit, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(label);
  const [saving,  setSaving]  = useState(false);

  async function save() {
    if (!draft.trim() || draft === label) { setEditing(false); return; }
    setSaving(true);
    await onSave(draft.trim());
    setSaving(false);
    setEditing(false);
  }

  if (editing) {
    return (
      <span className="label-edit-row">
        <input
          autoFocus
          className="label-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
        />
        <button className="btn-sm btn-teal" onClick={save} disabled={saving}>✓</button>
        <button className="btn-sm btn-ghost" onClick={() => setEditing(false)}>✕</button>
      </span>
    );
  }

  return (
    <span className="vienna-bar-label">
      {label}
      {canEdit && (
        <button
          className="label-edit-btn"
          onClick={() => { setDraft(label); setEditing(true); }}
          title="Rename"
        >✎</button>
      )}
    </span>
  );
}

function ProgressBar({ label, value, color, editable, canEditLabel, token, barKey, settingsKey, onUpdate, onLabelSave }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value);
  const [saving,  setSaving]  = useState(false);

  async function saveValue() {
    setSaving(true);
    try {
      const updated = await updateResearch(token, barKey, draft);
      onUpdate(updated);
      setEditing(false);
    } catch { /* ignore */ }
    setSaving(false);
  }

  async function saveLabel(newLabel) {
    if (barKey) {
      // Research bar — save label via research endpoint
      const updated = await updateResearch(token, barKey, undefined, newLabel);
      onUpdate(updated);
    } else if (settingsKey && onLabelSave) {
      // Computed bar — save via settings
      await onLabelSave(settingsKey, newLabel);
    }
  }

  return (
    <div className="vienna-bar-row">
      <div className="vienna-bar-header">
        <EditableLabel label={label} canEdit={canEditLabel} onSave={saveLabel} />
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
          <button className="btn-sm btn-teal" onClick={saveValue} disabled={saving}>Save</button>
          <button className="btn-sm btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

function RecentGoal({ goal }) {
  if (!goal) return <div className="recent-goal-empty">—</div>;
  return (
    <div className="recent-goal-item">
      <div className="recent-goal-title">{goal.title}</div>
      <div className="recent-goal-bar-row">
        <div className="mini-track" style={{ flex: 1 }}>
          <div className="mini-fill self-fill" style={{ width: `${goal.selfProgress}%` }} />
        </div>
        <span style={{ fontSize: '0.75rem', color: '#6B7A8A', minWidth: 28, textAlign: 'right' }}>
          {goal.selfProgress}%
        </span>
      </div>
      {goal.judgeComment && <div className="recent-goal-comment">"{goal.judgeComment}"</div>}
    </div>
  );
}

export default function UserProgressSection({
  userLabel,
  barA, barB,
  barAKey, barBKey,
  barASettingsKey, barBSettingsKey,
  barAColor, barBColor,
  recentGoals = [],
  canEdit = false,
  token, role,
  onUpdate,
  onLabelSave,
}) {
  const isAdmin = role === 'admin';
  const [g1, g2] = recentGoals;

  return (
    <div className="vienna-user-section dashed">
      <div className="vienna-user-label">{userLabel}</div>
      <div className="vienna-user-inner">
        <div className="vienna-bars-col">
          <ProgressBar
            label={barA.label}
            value={barA.value}
            color={barAColor}
            editable={canEdit && !!barAKey}
            canEditLabel={isAdmin}
            token={token}
            barKey={barAKey}
            settingsKey={barASettingsKey}
            onUpdate={onUpdate}
            onLabelSave={onLabelSave}
          />
          <ProgressBar
            label={barB.label}
            value={barB.value}
            color={barBColor}
            editable={canEdit && !!barBKey}
            canEditLabel={isAdmin}
            token={token}
            barKey={barBKey}
            settingsKey={barBSettingsKey}
            onUpdate={onUpdate}
            onLabelSave={onLabelSave}
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
