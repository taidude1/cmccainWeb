import { useState } from 'react';
import GoalCard from './GoalCard.jsx';
import { createGoal } from '../api.js';

export default function GoalsList({ goals, setGoals, token }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const goal = await createGoal(token, { title, description: desc });
      setGoals(prev => [...prev, goal]);
      setTitle('');
      setDesc('');
      setAdding(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="goals-section">
      <div className="goals-header">
        <h2>Goals</h2>
        {token && !adding && (
          <button onClick={() => setAdding(true)} className="btn-primary">+ Add Goal</button>
        )}
      </div>

      {adding && (
        <form className="add-goal-form" onSubmit={handleAdd}>
          <input
            placeholder="Goal title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
          <textarea
            placeholder="Description (optional)"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            rows={2}
          />
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving || !title.trim()}>
              {saving ? 'Adding…' : 'Add'}
            </button>
            <button type="button" onClick={() => setAdding(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {goals.length === 0 && !adding && (
        <p className="empty-state">
          {token ? 'No goals yet — add one above.' : 'No goals posted yet.'}
        </p>
      )}

      <div className="goals-list">
        {goals.map(goal => (
          <GoalCard
            key={goal.id}
            goal={goal}
            token={token}
            onUpdate={updated => setGoals(prev => prev.map(g => g.id === updated.id ? updated : g))}
            onDelete={id => setGoals(prev => prev.filter(g => g.id !== id))}
          />
        ))}
      </div>
    </section>
  );
}
