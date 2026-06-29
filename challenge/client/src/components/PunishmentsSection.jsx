import { useState } from 'react';
import SpotlightCard from './SpotlightCard.jsx';
import {
  createPunishment, executePunishment, submitPunishment,
  completePunishment, deletePunishment, updatePunishment
} from '../api.js';

function statusBadge(p) {
  if (p.executePending && p.status !== 'completed') return <span className="badge badge-execute">⚡ Execution Called</span>;
  if (p.status === 'completed') return <span className="badge badge-completed">Completed</span>;
  if (p.status === 'submitted') return <span className="badge badge-submitted">Submitted</span>;
  return <span className="badge badge-pending">Pending</span>;
}

export default function PunishmentsSection({ punishments, setPunishments, token, role }) {
  const [adding,      setAdding]      = useState(false);
  const [editId,      setEditId]      = useState(null);
  const [form,        setForm]        = useState({ title: '', description: '', assignedTo: 'connor' });
  const [editForm,    setEditForm]    = useState({});
  const [submitId,    setSubmitId]    = useState(null);
  const [submitNote,  setSubmitNote]  = useState('');
  const [saving,      setSaving]      = useState(false);

  const isAdmin     = role === 'admin';
  const isChallenge = role === 'challenge';
  const isViewer    = role === 'viewer';

  async function addPunishment(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const p = await createPunishment(token, form);
      setPunishments(prev => [...prev, p]);
      setForm({ title: '', description: '', assignedTo: 'connor' });
      setAdding(false);
    } catch { /* ignore */ }
    setSaving(false);
  }

  async function handleEdit(id) {
    try {
      const updated = await updatePunishment(token, id, editForm);
      setPunishments(prev => prev.map(p => p.id === id ? updated : p));
      setEditId(null);
    } catch { /* ignore */ }
  }

  async function handleExecute(id) {
    const updated = await executePunishment(token, id);
    setPunishments(prev => prev.map(p => p.id === id ? updated : p));
  }

  async function handleSubmit(id) {
    const updated = await submitPunishment(token, id, submitNote);
    setPunishments(prev => prev.map(p => p.id === id ? updated : p));
    setSubmitId(null);
    setSubmitNote('');
  }

  async function handleComplete(id) {
    const updated = await completePunishment(token, id);
    setPunishments(prev => prev.map(p => p.id === id ? updated : p));
  }

  async function handleDelete(id) {
    if (!confirm('Delete this punishment?')) return;
    await deletePunishment(token, id);
    setPunishments(prev => prev.filter(p => p.id !== id));
  }

  return (
    <SpotlightCard>
      <div style={{ padding: '1.25rem 1.5rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="section-heading" style={{ marginBottom: 0 }}>Punishments</div>
        {(isAdmin || isChallenge) && (
          <button className="btn-ghost btn-sm" onClick={() => setAdding(a => !a)}>
            {adding ? 'Cancel' : '+ Add'}
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={addPunishment} style={{ margin: '0 1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'rgba(201,107,58,0.04)', border: '1px solid rgba(201,107,58,0.15)', borderRadius: 10, padding: '1rem' }}>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Punishment title" />
          <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Details (optional)" />
          {isAdmin && (
            <select value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
              <option value="connor">Connor</option>
              <option value="jack">Jack</option>
            </select>
          )}
          <div className="form-actions">
            <button type="submit" className="btn-terra btn-sm" disabled={saving}>Add Punishment</button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="punishments-list">
        {punishments.length === 0 && <div className="empty-state">No punishments yet.</div>}
        {punishments.map(p => (
          <div key={p.id} className={`punishment-card${p.executePending && p.status !== 'completed' ? ' execute-pending' : ''}`}>
            {editId === p.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input value={editForm.title ?? p.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                <textarea rows={2} value={editForm.description ?? p.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                <div className="form-actions">
                  <button className="btn-sm btn-primary" onClick={() => handleEdit(p.id)}>Save</button>
                  <button className="btn-sm btn-ghost" onClick={() => setEditId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="punishment-header">
                  <div className="punishment-title">{p.title}</div>
                  {(isAdmin || isViewer) && (
                    <div className="card-actions">
                      {(isAdmin || isViewer) && (
                        <button className="btn-ghost btn-sm" onClick={() => { setEditId(p.id); setEditForm({ title: p.title, description: p.description }); }}>Edit</button>
                      )}
                      {isAdmin && (
                        <button className="btn-danger btn-sm" onClick={() => handleDelete(p.id)}>×</button>
                      )}
                    </div>
                  )}
                </div>

                <div className="punishment-meta">
                  {statusBadge(p)}
                  <span className="badge badge-person">{p.assignedTo}</span>
                  {p.executedBy && <span className="badge badge-execute">Called by {p.executedBy}</span>}
                </div>

                {p.description && <div className="punishment-desc">{p.description}</div>}

                {p.executePending && p.status !== 'completed' && isAdmin && (
                  <div className="execute-alert">⚡ Execution requested — submit proof to resolve</div>
                )}

                {submitId === p.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <textarea rows={2} value={submitNote} onChange={e => setSubmitNote(e.target.value)} placeholder="Proof or note…" />
                    <div className="form-actions">
                      <button className="btn-sm btn-teal" onClick={() => handleSubmit(p.id)}>Submit</button>
                      <button className="btn-sm btn-ghost" onClick={() => setSubmitId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="punishment-actions">
                    {(isChallenge || isViewer) && p.status !== 'completed' && (
                      <button className="btn-terra btn-sm" onClick={() => handleExecute(p.id)}>⚡ Execute</button>
                    )}
                    {(isAdmin || isChallenge) && p.status !== 'completed' && (
                      <button className="btn-teal btn-sm" onClick={() => setSubmitId(p.id)}>Submit Proof</button>
                    )}
                    {isViewer && p.status !== 'completed' && (
                      <button className="btn-primary btn-sm" onClick={() => handleComplete(p.id)}>Mark Complete</button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </SpotlightCard>
  );
}
