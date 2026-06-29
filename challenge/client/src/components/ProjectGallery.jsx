import { useState } from 'react';
import { createProject, deleteProject } from '../api.js';

function ProjectModal({ project, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="project-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        {project.imageUrl && (
          <img src={project.imageUrl} alt={project.title} className="project-modal-img" />
        )}
        <h2 className="project-modal-title">{project.title}</h2>
        <p className="project-modal-owner">by {project.owner} · {new Date(project.createdAt).toLocaleDateString()}</p>
        {project.description && <p className="project-modal-desc">{project.description}</p>}
        {project.tags?.length > 0 && (
          <div className="project-tags">
            {project.tags.map(t => <span key={t} className="project-tag">{t}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

function AddProjectForm({ token, onAdd, onClose }) {
  const [form, setForm] = useState({ title: '', description: '', imageUrl: '', tags: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const proj = await createProject(token, { ...form, tags });
      onAdd(proj);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="project-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--forest)', marginBottom: '1.25rem' }}>Submit Project</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            autoFocus
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Project title"
          />
          <textarea
            rows={3}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="What did you build / research?"
          />
          <input
            value={form.imageUrl}
            onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
            placeholder="Image URL (optional)"
          />
          <input
            value={form.tags}
            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            placeholder="Tags (comma-separated)"
          />
          {error && <div className="error-msg">{error}</div>}
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Submitting…' : 'Submit Project (+10 pts)'}
            </button>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectGallery({ projects = [], setProjects, token, role }) {
  const [selected, setSelected] = useState(null);
  const [adding,   setAdding]   = useState(false);
  const [featured, setFeatured] = useState(0);

  const canAdd = role === 'admin' || role === 'challenge';

  function handleAdd(proj) {
    setProjects(prev => [proj, ...prev]);
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!confirm('Delete this project?')) return;
    await deleteProject(token, id);
    setProjects(prev => prev.filter(p => p.id !== id));
  }

  const displayProjects = projects.slice(0, 6);

  return (
    <div className="project-gallery-wrap">
      <div className="project-gallery-header">
        <div className="section-heading" style={{ marginBottom: 0 }}>Projects</div>
        {canAdd && (
          <button className="btn-ghost btn-sm" onClick={() => setAdding(true)}>+ Submit</button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="project-gallery-empty">
          <div style={{ fontSize: '2rem' }}>📦</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>No projects yet — each one is worth 10 points</div>
        </div>
      ) : (
        <>
          <div className="project-grid">
            {displayProjects.map((proj, i) => (
              <div
                key={proj.id}
                className={`project-card${featured === i ? ' featured' : ''}`}
                onClick={() => setSelected(proj)}
              >
                {proj.imageUrl ? (
                  <img src={proj.imageUrl} alt={proj.title} className="project-card-img" onError={e => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="project-card-placeholder">
                    <span>{proj.owner === 'jack' ? '🔬' : '💡'}</span>
                  </div>
                )}
                <div className="project-card-body">
                  <div className="project-card-title">{proj.title}</div>
                  <div className="project-card-owner">{proj.owner}</div>
                </div>
                {(role === 'admin' || (role === 'challenge' && proj.owner === 'jack')) && (
                  <button className="project-delete-btn" onClick={e => handleDelete(proj.id, e)}>×</button>
                )}
              </div>
            ))}
          </div>

          {/* Featured description cycles through projects */}
          {displayProjects[featured] && (
            <div className="project-featured-desc">
              <div className="project-featured-title">{displayProjects[featured].title}</div>
              {displayProjects[featured].description && (
                <div className="project-featured-body">{displayProjects[featured].description.slice(0, 180)}{displayProjects[featured].description.length > 180 ? '…' : ''}</div>
              )}
              <div className="project-featured-nav">
                {displayProjects.map((_, i) => (
                  <button
                    key={i}
                    className={`featured-dot${featured === i ? ' active' : ''}`}
                    onClick={() => setFeatured(i)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
      {adding   && <AddProjectForm token={token} onAdd={handleAdd} onClose={() => setAdding(false)} />}
    </div>
  );
}
