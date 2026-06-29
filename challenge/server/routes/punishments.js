import { Router } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const PATH = './data/punishments.json';

function read() { return JSON.parse(readFileSync(PATH, 'utf8')); }
function write(d) { writeFileSync(PATH, JSON.stringify(d, null, 2)); }

// Public — anyone can view
router.get('/', (req, res) => res.json(read()));

// Admin + challenge can create punishments
router.post('/', requireAuth, (req, res) => {
  const { role } = req.user;
  if (!['admin', 'challenge'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  const { title, description = '', assignedTo = 'connor' } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });

  const p = {
    id: randomUUID(),
    title: title.trim(),
    description: description.trim(),
    assignedTo,
    status: 'pending',
    submissionNote: '',
    executePending: false,
    executedBy: null,
    createdAt: new Date().toISOString()
  };
  const list = read();
  list.push(p);
  write(list);
  res.status(201).json(p);
});

// General update — admin edits fields; viewer can change punishments
router.put('/:id', requireAuth, (req, res) => {
  const { role } = req.user;
  const list = read();
  const idx = list.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const { title, description, assignedTo } = req.body;

  if (role === 'admin') {
    if (title !== undefined) list[idx].title = title.trim();
    if (description !== undefined) list[idx].description = description.trim();
    if (assignedTo !== undefined) list[idx].assignedTo = assignedTo;
  } else if (role === 'viewer') {
    // Yitian can change punishment details
    if (title !== undefined) list[idx].title = title.trim();
    if (description !== undefined) list[idx].description = description.trim();
    if (assignedTo !== undefined) list[idx].assignedTo = assignedTo;
  } else {
    return res.status(403).json({ error: 'Forbidden' });
  }

  write(list);
  res.json(list[idx]);
});

// Submit proof — admin + challenge (for punishments assigned to them)
router.post('/:id/submit', requireAuth, (req, res) => {
  const { role, username } = req.user;
  if (!['admin', 'challenge'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  const list = read();
  const idx = list.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  list[idx].status = 'submitted';
  list[idx].submissionNote = req.body.note || '';
  list[idx].submittedBy = username;
  list[idx].submittedAt = new Date().toISOString();
  write(list);
  res.json(list[idx]);
});

// Execute (call out) — challenge + viewer
router.post('/:id/execute', requireAuth, (req, res) => {
  const { role, username } = req.user;
  if (!['challenge', 'viewer'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  const list = read();
  const idx = list.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  list[idx].executePending = true;
  list[idx].executedBy = username;
  list[idx].executedAt = new Date().toISOString();
  write(list);
  res.json(list[idx]);
});

// Mark complete — viewer only
router.post('/:id/complete', requireAuth, (req, res) => {
  if (req.user.role !== 'viewer') return res.status(403).json({ error: 'Forbidden' });

  const list = read();
  const idx = list.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  list[idx].status = 'completed';
  list[idx].executePending = false;
  list[idx].completedAt = new Date().toISOString();
  write(list);
  res.json(list[idx]);
});

// Delete — admin only
router.delete('/:id', requireAdmin, (req, res) => {
  const list = read();
  const filtered = list.filter(p => p.id !== req.params.id);
  if (filtered.length === list.length) return res.status(404).json({ error: 'Not found' });
  write(filtered);
  res.json({ success: true });
});

export default router;
