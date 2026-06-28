import { useState } from 'react';
import { createCompetitorGoal, updateCompetitorGoal, deleteCompetitorGoal } from '../api.js';

const MAJOR_META = {
  finance:     { label: 'Finance Major',      color: '#3fb950' },
  cs:          { label: 'CS Major',            color: '#58a6ff' },
  engineering: { label: 'Engineering Major',   color: '#e3b341' },
};

const PACE_OPTIONS = ['ahead', 'on-track', 'behind', 'struggling'];
const PACE_LABEL   = { ahead: '🔥 Ahead', 'on-track': '✓ On track', behind: '⏳ Behind', struggling: '💤 Struggling' };

function CompetitorGoalItem({ goal, token, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: goal.title, description: goal.description, pace: goal.pace });

  async function save() {
    const updated = await updateCompetitorGoal(token, goal.id, form);
    onUpdate(updated);
    setEditing(false);
  }

  async function remove() {
    if (!window.confirm(`Delete "${goal.title}"?`)) return;
    await deleteCompetitorGoal(token, goal.id);
    onDelete(goal.id);
  }

  const { color } = MAJOR_META[goal.major];

  if (editing) {
    return (
      <div className="cg-item cg-editing">
        <input
          className="cg-edit-title"
          value={form.title}
          onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
        />
        <textarea
          value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          rows={2}
          placeholder="Description"
        />
        <select value={form.pace} onChange={e => setForm(p => ({ ...p, pace: e.target.value }))}>
          {PACE_OPTIONS.map(p => <option key={p} value={p}>{PACE_LABEL[p]}</option>)}
        </select>
        <div className="form-actions">
          <button onClick={save} className="btn-primary btn-sm">Save</button>
          <button onClick={() => setEditing(false)} className="btn-secondary btn-sm">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cg-item">
      <div className="cg-item-header">
        <span className="cg-title">{goal.title}</span>
        {token && (
          <div className="card-actions">
            <button onClick={() => setEditing(true)} className="btn-secondary btn-sm">Edit</button>
            <button onClick={remove} className="btn-danger btn-sm">✕</button>
          </div>
        )}
      </div>
      {goal.description && <p className="cg-desc">{goal.description}</p>}
      <div className="cg-progress-row">
        <div className="mini-track">
          <div className="mini-fill" style={{ width: `${goal.currentProgress}%`, background: color }} />
        </div>
        <span className="cg-pct">{goal.currentProgress}%</span>
      </div>
      <span className="cg-pace">{PACE_LABEL[goal.pace]}</span>
    </div>
  );
}

function MajorColumn({ major, goals, algorithms, token, onAdd, onUpdate, onDelete }) {
  const { label, color } = MAJOR_META[major];
  const algPct = algorithms?.[major] ?? 0;

  return (
    <div className="major-col">
      <div className="major-col-header">
        <span className="major-col-label" style={{ color }}>{label}</span>
        <span className="major-col-pct" style={{ color }}>{algPct}%</span>
      </div>
      <div className="progress-track" style={{ marginBottom: '1rem' }}>
        <div className="progress-fill" style={{ width: `${algPct}%`, background: color }} />
      </div>

      <div className="cg-list">
        {goals.map(g => (
          <CompetitorGoalItem
            key={g.id}
            goal={g}
            token={token}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
        {goals.length === 0 && <p className="empty-state" style={{ fontSize: '0.8rem' }}>No goals yet.</p>}
      </div>

      {token && <AddCompetitorGoal major={major} token={token} onAdd={onAdd} />}
    </div>
  );
}

function AddCompetitorGoal({ major, token, onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', pace: 'on-track' });
  const [saving, setSaving] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const goal = await createCompetitorGoal(token, { ...form, major });
      onAdd(goal);
      setForm({ title: '', description: '', pace: 'on-track' });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary btn-sm cg-add-btn">
        + Add goal
      </button>
    );
  }

  return (
    <form className="cg-add-form" onSubmit={handleAdd}>
      <input
        placeholder="Goal title"
        value={form.title}
        onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
        autoFocus
      />
      <textarea
        placeholder="Description (optional)"
        value={form.description}
        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
        rows={2}
      />
      <select value={form.pace} onChange={e => setForm(p => ({ ...p, pace: e.target.value }))}>
        {PACE_OPTIONS.map(p => <option key={p} value={p}>{PACE_LABEL[p]}</option>)}
      </select>
      <div className="form-actions">
        <button type="submit" className="btn-primary btn-sm" disabled={saving || !form.title.trim()}>
          {saving ? 'Adding…' : 'Add'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary btn-sm">Cancel</button>
      </div>
    </form>
  );
}

export default function CompetitorSection({ competitorGoals, setCompetitorGoals, algorithms, token }) {
  const byMajor = (major) => competitorGoals.filter(g => g.major === major);

  function handleAdd(goal) {
    setCompetitorGoals(prev => [...prev, goal]);
  }
  function handleUpdate(updated) {
    setCompetitorGoals(prev => prev.map(g => g.id === updated.id ? updated : g));
  }
  function handleDelete(id) {
    setCompetitorGoals(prev => prev.filter(g => g.id !== id));
  }

  return (
    <section className="competitor-section">
      <h2 className="section-title">Competitors</h2>
      <div className="competitor-grid">
        {['finance', 'cs', 'engineering'].map(major => (
          <MajorColumn
            key={major}
            major={major}
            goals={byMajor(major)}
            algorithms={algorithms}
            token={token}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </section>
  );
}
