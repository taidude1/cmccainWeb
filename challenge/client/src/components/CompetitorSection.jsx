import { useState } from 'react';
import SpotlightCard from './SpotlightCard.jsx';
import {
  createCompetitorGoal, updateCompetitorGoal, deleteCompetitorGoal, updateSettings
} from '../api.js';

const MAJORS = [
  { key: 'finance',     label: 'Finance',     color: '#2A5C45' },
  { key: 'cs',          label: 'CS',          color: '#4DA8A4' },
  { key: 'engineering', label: 'Engineering', color: '#8A9BAA' },
];

const PACES = ['ahead', 'on-track', 'behind', 'struggling'];

export default function CompetitorSection({ competitorGoals, setCompetitorGoals, algorithms, token, settings, setSettings }) {
  const [addingFor, setAddingFor]   = useState(null);
  const [editId,    setEditId]      = useState(null);
  const [form,      setForm]        = useState({ title: '', description: '', pace: 'on-track', major: '' });
  const [saving,    setSaving]      = useState(false);
  const [editCtx,   setEditCtx]     = useState(false);
  const [ctxDraft,  setCtxDraft]    = useState('');

  async function saveGoal(major) {
    setSaving(true);
    try {
      if (editId) {
        const updated = await updateCompetitorGoal(token, editId, form);
        setCompetitorGoals(cg => cg.map(g => g.id === editId ? updated : g));
        setEditId(null);
      } else {
        const created = await createCompetitorGoal(token, { ...form, major });
        setCompetitorGoals(cg => [...cg, created]);
        setAddingFor(null);
      }
      setForm({ title: '', description: '', pace: 'on-track', major: '' });
    } catch { /* ignore */ }
    setSaving(false);
  }

  async function deleteGoal(id) {
    await deleteCompetitorGoal(token, id);
    setCompetitorGoals(cg => cg.filter(g => g.id !== id));
  }

  async function saveContext() {
    const updated = await updateSettings(token, { weeklyContext: ctxDraft });
    setSettings(updated);
    setEditCtx(false);
  }

  function startAdd(major) {
    setAddingFor(major);
    setEditId(null);
    setForm({ title: '', description: '', pace: 'on-track', major });
  }

  function startEdit(g) {
    setEditId(g.id);
    setAddingFor(null);
    setForm({ title: g.title, description: g.description, pace: g.pace, major: g.major });
  }

  function cancelForm() {
    setAddingFor(null);
    setEditId(null);
    setForm({ title: '', description: '', pace: 'on-track', major: '' });
  }

  return (
    <SpotlightCard className="section-card">
      <div className="section-heading">Competitor Goals</div>

      {/* Weekly context bar */}
      <div className="context-bar">
        <span className="context-label">This Week</span>
        {editCtx ? (
          <>
            <input
              className="context-input"
              value={ctxDraft}
              onChange={e => setCtxDraft(e.target.value)}
              placeholder="Add context for competitors…"
            />
            <button className="btn-sm btn-teal"  onClick={saveContext}>Save</button>
            <button className="btn-sm btn-ghost"  onClick={() => setEditCtx(false)}>Cancel</button>
          </>
        ) : (
          <>
            <span className="context-text">{settings.weeklyContext || 'No context set for this week.'}</span>
            <button className="btn-sm btn-ghost" onClick={() => { setCtxDraft(settings.weeklyContext); setEditCtx(true); }}>Edit</button>
          </>
        )}
      </div>

      <div className="competitor-grid">
        {MAJORS.map(({ key, label, color }) => {
          const goals = competitorGoals.filter(g => g.major === key);
          const algPct = algorithms?.[key] ?? 0;

          return (
            <SpotlightCard key={key} className="major-col-card">
              <div className="major-col-header">
                <span className="major-col-label" style={{ color }}>{label}</span>
                <span className="major-col-pct"   style={{ color }}>{algPct}%</span>
              </div>
              <div className="progress-track" style={{ marginBottom: '0.75rem' }}>
                <div className="progress-fill" style={{ width: `${algPct}%`, background: color }} />
              </div>

              <div className="cg-list">
                {goals.map(g => {
                  const isEditing = editId === g.id;
                  return (
                    <div className="cg-item" key={g.id}>
                      {isEditing ? (
                        <div className="cg-add-form">
                          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Goal title" />
                          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
                          <select value={form.pace} onChange={e => setForm(f => ({ ...f, pace: e.target.value }))}>
                            {PACES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                          <div className="form-actions">
                            <button className="btn-sm btn-primary" onClick={() => saveGoal(key)} disabled={saving}>Save</button>
                            <button className="btn-sm btn-ghost" onClick={cancelForm}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="cg-item-header">
                            <span className="cg-title">{g.title}</span>
                            <div className="card-actions">
                              <button className="btn-sm btn-ghost" onClick={() => startEdit(g)}>Edit</button>
                              <button className="btn-danger btn-sm" onClick={() => deleteGoal(g.id)}>×</button>
                            </div>
                          </div>
                          {g.description && <div className="cg-desc">{g.description}</div>}
                          <div className="cg-mini-row">
                            <div className="progress-track" style={{ height: '4px' }}>
                              <div className="progress-fill" style={{ width: `${g.currentProgress ?? 0}%`, background: color }} />
                            </div>
                            <span className="cg-pct" style={{ color }}>{g.currentProgress ?? 0}%</span>
                          </div>
                          <div className="cg-pace">{g.pace}</div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {addingFor === key ? (
                <div className="cg-add-form">
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Goal title" />
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
                  <select value={form.pace} onChange={e => setForm(f => ({ ...f, pace: e.target.value }))}>
                    {PACES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <div className="form-actions">
                    <button className="btn-sm btn-primary" onClick={() => saveGoal(key)} disabled={saving}>Save</button>
                    <button className="btn-sm btn-ghost" onClick={cancelForm}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="btn-ghost btn-sm cg-add-btn" onClick={() => startAdd(key)}>+ Add goal</button>
              )}
            </SpotlightCard>
          );
        })}
      </div>
    </SpotlightCard>
  );
}
