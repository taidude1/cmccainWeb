import { useState } from 'react';
import SpotlightCard from './SpotlightCard.jsx';
import GoalCard from './GoalCard.jsx';
import { createGoal } from '../api.js';

export default function GoalsList({ title, owner, goals, setGoals, allGoals, token, role, canEdit }) {
  const [adding, setAdding] = useState(false);
  const [form,   setForm]   = useState({ title: '', description: '' });
  const [saving, setSaving] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const created = await createGoal(token, form);
      setGoals([...allGoals, created]);
      setForm({ title: '', description: '' });
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
