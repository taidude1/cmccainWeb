import { useState } from 'react';
import { updateGoal, deleteGoal } from '../api.js';

export default function GoalCard({ goal, token, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: goal.title,
    description: goal.description,
    selfProgress: goal.selfProgress,
    judgeProgress: goal.judgeProgress,
    judgeComment: goal.judgeComment,
  });
  const [saving, setSaving] = useState(false);

  function set(key) {
    return e => setForm(prev => ({ ...prev, [key]: e.target.value }));
  }

  function setNum(key) {
    return e => setForm(prev => ({ ...prev, [key]: Number(e.target.value) }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateGoal(token, goal.id, form);
      onUpdate(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${goal.title}"?`)) return;
    await deleteGoal(token, goal.id);
    onDelete(goal.id);
  }

  function cancelEdit() {
    setForm({
      title: goal.title,
      description: goal.description,
      selfProgress: goal.selfProgress,
      judgeProgress: goal.judgeProgress,
      judgeComment: goal.judgeComment,
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="goal-card">
        <div className="goal-edit">
          <input className="edit-title" value={form.title} onChange={set('title')} />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={set('description')}
            rows={2}
          />

          <label className="slider-label">
            My Progress: {form.selfProgress}%
            <input
              type="range" min={0} max={100}
              value={form.selfProgress}
              onChange={setNum('selfProgress')}
            />
          </label>

          <label className="slider-label">
            Judge Score: {form.judgeProgress}%
            <input
              type="range" min={0} max={100}
              value={form.judgeProgress}
              onChange={setNum('judgeProgress')}
            />
          </label>

          <textarea
            placeholder="Judge comment…"
            value={form.judgeComment}
            onChange={set('judgeComment')}
            rows={2}
          />

          <div className="form-actions">
            <button onClick={handleSave} className="btn-primary" disabled={saving || !form.title.trim()}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={cancelEdit} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="goal-card">
      <div className="goal-card-header">
        <h3>{goal.title}</h3>
        {token && (
          <div className="card-actions">
            <button onClick={() => setEditing(true)} className="btn-secondary btn-sm">Edit</button>
            <button onClick={handleDelete} className="btn-danger btn-sm">Delete</button>
          </div>
        )}
      </div>

      {goal.description && <p className="goal-desc">{goal.description}</p>}

      <div className="goal-progress-rows">
        <div className="mini-progress-row">
          <span>Self</span>
          <div className="mini-track">
            <div className="mini-fill self-fill" style={{ width: `${goal.selfProgress}%` }} />
          </div>
          <span>{goal.selfProgress}%</span>
        </div>
        <div className="mini-progress-row">
          <span>Judge</span>
          <div className="mini-track">
            <div className="mini-fill judge-fill" style={{ width: `${goal.judgeProgress}%` }} />
          </div>
          <span>{goal.judgeProgress}%</span>
        </div>
      </div>

      {goal.judgeComment && (
        <blockquote className="judge-comment">"{goal.judgeComment}"</blockquote>
      )}
    </div>
  );
}
