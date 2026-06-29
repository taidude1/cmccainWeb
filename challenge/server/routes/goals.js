import { Router } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const PATH = './data/goals.json';

function read() {
  const goals = JSON.parse(readFileSync(PATH, 'utf8'));
  return goals.map(g => ({ owner: 'connor', ...g })); // migrate old goals
}
function write(d) { writeFileSync(PATH, JSON.stringify(d, null, 2)); }

function ownerForRole(role) {
  return role === 'challenge' ? 'jack' : 'connor';
}

// Public
router.get('/', (req, res) => res.json(read()));

// Create — admin creates connor goals, challenge creates jack goals
router.post('/', requireAuth, (req, res) => {
  const { title, description = '' } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });

  const owner = ownerForRole(req.user.role);
  const goal = {
    id: randomUUID(), owner,
    title: title.trim(), description: description.trim(),
    selfProgress: 0, judgeProgress: 0, judgeComment: '',
    createdAt: new Date().toISOString()
  };
  const goals = read();
  goals.push(goal);
  write(goals);
  res.status(201).json(goal);
});

// Update — admin can update any; challenge only their own
router.put('/:id', requireAuth, (req, res) => {
  const goals = read();
  const idx = goals.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const { role } = req.user;
  if (role === 'challenge' && goals[idx].owner !== 'jack') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (role === 'viewer') return res.status(403).json({ error: 'Forbidden' });

  const { title, description, selfProgress, judgeProgress, judgeComment } = req.body;
  const clamp = v => Math.max(0, Math.min(100, Number(v)));

  goals[idx] = {
    ...goals[idx],
    ...(title       !== undefined && { title: title.trim() }),
    ...(description !== undefined && { description: description.trim() }),
    ...(selfProgress  !== undefined && { selfProgress:  clamp(selfProgress) }),
    ...(judgeProgress !== undefined && { judgeProgress: clamp(judgeProgress) }),
    ...(judgeComment  !== undefined && { judgeComment }),
  };
  write(goals);
  res.json(goals[idx]);
});

// Delete — admin any, challenge own only
router.delete('/:id', requireAuth, (req, res) => {
  const goals = read();
  const target = goals.find(g => g.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Not found' });

  const { role } = req.user;
  if (role === 'challenge' && target.owner !== 'jack') return res.status(403).json({ error: 'Forbidden' });
  if (role === 'viewer') return res.status(403).json({ error: 'Forbidden' });

  write(goals.filter(g => g.id !== req.params.id));
  res.json({ success: true });
});

export default router;
