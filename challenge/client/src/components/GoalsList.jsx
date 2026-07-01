import { useState } from 'react';
import SpotlightCard from './SpotlightCard.jsx';
import GoalCard from './GoalCard.jsx';
import { createGoal } from '../api.js';

export default function GoalsList({ title, owner, goals, setGoals, allGoals, token, role, canEdit, adminMode = false }) {
  const [adding, setAdding] = useState(false);
  const [form,   setForm]   = useState({ title: '', description: '', type: 'daily', dueDate: '', points: 1 });
  const [saving, setSaving] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title:       form.title,
        description: form.description,
        type:        form.type,
        dueDate:     form.dueDate || null,
        points:      Number(form.points) || 1,
        ...(adminMode ? { owner } : {}),
      };
      const created = await createGoal(token, payload);
      setGoals([...allGoals, created]);
      setForm({ title: '', description: '', type: 'daily', dueDate: '', points: 1 });
      setAdding(false);
    } catch { /* ignore */ }
    setSaving(false);
  }

  return (
    <SpotlightCard className="goals-section">
      <div className="goals-section-header">
        <span className="goals-section-title">{title}</span>
        {canEdit && (
          <button className="btn-ghost btn-sm" onClick={() => setAdding(a => !a)}>
            {adding ? 'Cancel' : '+ Add'}
          </button>
        )}
      </div>

      {adding && (
        <form className="add-goal-form" onSubmit={handleAdd}>
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
          {adminMode && (
            <div className="goal-form-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%' }}>
                Points:
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.points}
                  onChange={e => setForm(f => ({ ...f, points: e.target.value }))}
                  style={{ width: 60 }}
                />
              </label>
            </div>
          )}
          <div className="form-actions">
            <button type="submit" className="btn-primary btn-sm" disabled={saving}>Add</button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="goals-list">
        {goals.length === 0 && <div className="empty-state">No goals yet.</div>}
        {goals.map(goal => (
          <GoalCard
            key={goal.id}
            goal={goal}
            allGoals={allGoals}
            setGoals={setGoals}
            token={token}
            canEdit={canEdit}
          />
        ))}
      </div>
    </SpotlightCard>
  );
}
