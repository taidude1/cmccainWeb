import { useState } from 'react';
import { createGoal } from '../api.js';

function TypeTag({ type }) {
  const cls = { daily: 'tag-daily', weekly: 'tag-weekly', specific: 'tag-specific' }[type] || 'tag-daily';
  return <span className={`goal-type-tag ${cls}`}>{type || 'daily'}</span>;
}

export default function OngoingGoals({ allGoals, setAllGoals, myGoals, token, role }) {
  const [adding, setAdding] = useState(false);
  const [form,   setForm]   = useState({ title: '', description: '', type: 'daily', dueDate: '' });
  const [saving, setSaving] = useState(false);

  const ongoing   = myGoals.filter(g => g.selfProgress < 100);
  const completed = myGoals.filter(g => g.selfProgress >= 100);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const created = await createGoal(token, {
        title:       form.title,
        description: form.description,
        type:        form.type,
        dueDate:     form.dueDate || null,
      });
      setAllGoals([...allGoals, created]);
      setForm({ title: '', description: '', type: 'daily', dueDate: '' });
      setAdding(false);
    } catch { /* ignore */ }
    setSaving(false);
  }

  return (
    <div className="ongoing-goals-card">
      <div className="ongoing-goals-header">
        <span className="ongoing-goals-title">Current Goals</span>
        <button className="btn-ghost btn-sm" onClick={() => setAdding(a => !a)}>
          {adding ? 'Cancel' : '+ Goal'}
        </button>
      </div>

      {adding && (
        <form className="add-goal-form" style={{ margin: '0 1.5rem 0.75rem' }} onSubmit={handleAdd}>
          <input
            autoFocus
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Goal title"
          />
          <textarea
            rows={2}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description (optional)"
          />
          <div className="goal-form-grid">
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="specific">Specific Date</option>
            </select>
            {form.type === 'specific' && (
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              />
            )}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary btn-sm" disabled={saving}>Add</button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </form>
      )}

      {ongoing.length === 0 && !adding && (
        <div className="empty-state">No active goals — add one above!</div>
      )}

      {ongoing.map(goal => (
        <div key={goal.id} className="ongoing-goal-item">
          <div className="ongoing-goal-top">
            <span className="ongoing-goal-title-text">{goal.title}</span>
            <TypeTag type={goal.type} />
          </div>
          {goal.description && <div className="ongoing-goal-desc">{goal.description}</div>}
          {goal.dueDate && (
            <div className="ongoing-goal-due">Due: {goal.dueDate}</div>
          )}
          <div className="ongoing-goal-progress">
            <div className="mini-track" style={{ flex: 1 }}>
              <div className="mini-fill self-fill" style={{ width: `${goal.selfProgress}%` }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 28 }}>
              {goal.selfProgress}%
            </span>
            <span className="ongoing-goal-pts">{goal.points || 1}pt</span>
          </div>
        </div>
      ))}

      {completed.length > 0 && (
        <details className="completed-goals-summary">
          <summary style={{ cursor: 'pointer', userSelect: 'none' }}>
            {completed.length} completed goal{completed.length !== 1 ? 's' : ''}
          </summary>
          {completed.map(goal => (
            <div key={goal.id} style={{ paddingTop: '0.5rem', opacity: 0.6, fontSize: '0.85rem' }}>
              <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>{goal.title}</span>
              <span style={{ color: 'var(--teal)', marginLeft: '0.5rem', fontSize: '0.75rem' }}>✓</span>
            </div>
          ))}
        </details>
      )}
    </div>
  );
}
