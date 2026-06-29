import { useState } from 'react';
import SpotlightCard from './SpotlightCard.jsx';
import { updateResearch } from '../api.js';

const BARS = [
  { key: 'overall', color: '#2A5C45', accentColor: 'var(--forest)' },
  { key: 'connor',  color: '#4DA8A4', accentColor: 'var(--teal)' },
  { key: 'jack',    color: '#C96B3A', accentColor: 'var(--terra)' },
];

export default function ResearchSection({ research, setResearch, token, role }) {
  const [editing, setEditing] = useState(null);
  const [draft,   setDraft]   = useState(0);
  const [saving,  setSaving]  = useState(false);

  function canEditBar(key) {
    if (role === 'admin')     return true;
    if (role === 'challenge') return key === 'jack';
    return false;
  }

  async function save(key) {
    setSaving(true);
    try {
      const updated = await updateResearch(token, key, draft);
      setResearch(updated);
      setEditing(null);
    } catch { /* ignore */ }
    setSaving(false);
  }

  return (
    <SpotlightCard className="section-card">
      <div className="section-heading">Entrepreneurship &amp; Research</div>
      <div className="research-bars">
        {BARS.map(({ key, color }) => {
          const bar = research[key];
          const isEditing = editing === key;
          return (
            <div className="research-bar-card" key={key}>
              <div className="research-bar-label">{bar.label}</div>
              <div className="research-bar-value" style={{ color }}>
                {isEditing ? `${Math.round(draft)}%` : `${bar.value}%`}
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${isEditing ? draft : bar.value}%`, background: color }}
                />
              </div>
              {canEditBar(key) && (
                <div className="research-edit-row">
                  {isEditing ? (
                    <>
                      <input
                        type="range" min="0" max="100"
                        value={draft}
                        onChange={e => setDraft(Number(e.target.value))}
                      />
                      <button
                        className="btn-sm btn-teal"
                        onClick={() => save(key)}
                        disabled={saving}
                      >Save</button>
                      <button className="btn-sm btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                    </>
                  ) : (
                    <button
                      className="btn-sm btn-ghost"
                      onClick={() => { setDraft(bar.value); setEditing(key); }}
                    >Edit</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SpotlightCard>
  );
}
