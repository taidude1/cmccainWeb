import { useState } from 'react';
import { submitGoal } from '../api.js';

export default function GoalSubmission({ allGoals, myGoals, setAllGoals, token }) {
  const [selectedId,  setSelectedId]  = useState('');
  const [text,        setText]        = useState('');
  const [file,        setFile]        = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState('');

  const ongoing = myGoals.filter(g => g.selfProgress < 100);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedId) return;
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      const updated = await submitGoal(token, selectedId, text, file);
      setAllGoals(allGoals.map(g => g.id === updated.id ? updated : g));
      setText('');
      setFile(null);
      setSelectedId('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message || 'Submission failed');
    }
    setSubmitting(false);
  }

  return (
    <div className="submission-canvas">
      <div className="submission-left">
        <div className="submission-heading">Submit Goal Completion</div>

        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          <option value="">Select a goal to complete…</option>
          {ongoing.map(g => (
            <option key={g.id} value={g.id}>
              {g.title} — {g.points || 1} pt
            </option>
          ))}
        </select>

        <textarea
          rows={3}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Describe what you completed, paste notes, or leave blank if uploading a file…"
          disabled={!selectedId}
        />

        {error   && <div className="error-msg">{error}</div>}
        {success && <div className="submission-success">✓ Goal marked complete!</div>}

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!selectedId || submitting}
        >
          {submitting ? 'Submitting…' : 'Submit Completion'}
        </button>
      </div>

      <label className="submission-file-zone">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.gif,.svg,.mp4,.mov,.txt,.doc,.docx"
          onChange={e => setFile(e.target.files[0] || null)}
          disabled={!selectedId}
        />
        <span className="submission-file-icon">📄</span>
        <span className="submission-file-label">
          {file ? 'File attached' : 'Add Your\nSubmission'}
        </span>
        {file && <span className="submission-file-name">{file.name}</span>}
      </label>
    </div>
  );
}
