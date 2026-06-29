import { useState } from 'react';
import { updateGoal, deleteGoal } from '../api.js';

export default function GoalCard({ goal, allGoals, setGoals, token, canEdit }) {
  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState({ title: goal.title, description: goal.description });
  const [sliders,  setSliders]  = useState({ selfProgress: goal.selfProgress, judgeProgress: goal.judgeProgress, judgeComment: goal.judgeComment });
  const [saving,   setSaving]   = useState(false);

  async function saveEdits() {
    setSaving(true);
    try {
      const updated = await updateGoal(token, goal.id, { ...form, ...sliders });
      setGoals(allGoals.map(g => g.id === goal.id ? updated : g));
      setEditing(false);
    } catch { /* ignore */ }
    setSaving(false);
  }

  async function remove() {
    if (!confirm('Delete this goal?')) return;
    await deleteGoal(token, goal.id);
    setGoals(allGoals.filter(g => g.id !== goal.id));
  }

  if (editing) {
    return (
      <div className="goal-card">
        <div className="add-goal-form">
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Goal title" />
          <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
          <label className="slider-label">
            Self progress: {sliders.selfProgress}%
            <input type="range" min="0" max="100" value={sliders.selfProgress} onChange={e => setSliders(s => ({ ...s, selfProgress: Number(e.target.value) }))} />
          </label>
          <label className="slider-label">
            Judge score: {sliders.judgeProgress}%
            <input type="range" min="0" max="100" value={sliders.judgeProgress} onChange={e => setSliders(s => ({ ...s, judgeProgress: Number(e.target.value) }))} />
          </label>
          <input value={sliders.judgeComment} onChange={e => setSliders(s => ({ ...s, judgeComment: e.target.value }))} placeholder="Judge comment (optional)" />
          <div className="form-actions">
            <button className="btn-primary btn-sm" onClick={saveEdits} disabled={saving}>Save</button>
            <button className="btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="goal-card">
      <div className="goal-card-header">
        <div className="goal-title">{goal.title}</div>
        {canEdit && (
          <div className="card-actions">
            <button className="btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn-danger btn-sm" onClick={remove}>×</button>
          </div>
        )}
      </div>
      {goal.description && <div className="goal-desc">{goal.description}</div>}

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
        <div className="judge-comment">"{goal.judgeComment}"</div>
      )}
    </div>
  );
}
