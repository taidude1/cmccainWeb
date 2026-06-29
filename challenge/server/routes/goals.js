import { Router } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const PATH = './data/goals.json';

function read() {
  const goals = JSON.parse(readFileSync(PATH, 'utf8'));
  return goals.map(g => ({ owner: 'connor', ...g }));
}
function write(d) { writeFileSync(PATH, JSON.stringify(d, null, 2)); }

function ownerForRole(role) {
  return role === 'challenge' ? 'jack' : 'connor';
}

router.get('/', (req, res) => res.json(read()));

router.post('/', requireAuth, (req, res) => {
  const { title, description = '' } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });

  const owner = ownerForRole(req.user.role);
  const selfProgress = 0;
  const goal = {
    id: randomUUID(), owner,
    title: title.trim(), description: description.trim(),
    selfProgress, judgeProgress: 0, judgeComment: '',
    createdAt: new Date().toISOString(),
    completedAt: selfProgress >= 100 ? new Date().toISOString() : null,
  };
  const goals = read();
  goals.push(goal);
  write(goals);
  res.status(201).json(goal);
});

router.put('/:id', requireAuth, (req, res) => {
  const goals = read();
  const idx = goals.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const { role } = req.user;
  if (role === 'challenge' && goals[idx].owner !== 'jack') return res.status(403).json({ error: 'Forbidden' });
  if (role === 'viewer') return res.status(403).json({ error: 'Forbidden' });

  const { title, description, selfProgress, judgeProgress, judgeComment } = req.body;
  const clamp = v => Math.max(0, Math.min(100, Number(v)));

  if (title !== undefined)       goals[idx].title       = title.trim();
  if (description !== undefined) goals[idx].description = description.trim();
  if (judgeComment !== undefined) goals[idx].judgeComment = judgeComment;
  if (judgeProgress !== undefined) goals[idx].judgeProgress = clamp(judgeProgress);

  if (selfProgress !== undefined) {
    const clamped = clamp(selfProgress);
    const wasComplete = goals[idx].selfProgress >= 100;
    goals[idx].selfProgress = clamped;
    // Stamp completedAt the first time it hits 100
    if (!wasComplete && clamped >= 100 && !goals[idx].completedAt) {
      goals[idx].completedAt = new Date().toISOString();
    }
    // Clear completedAt if walked back below 100
    if (clamped < 100) goals[idx].completedAt = null;
  }

  write(goals);
  res.json(goals[idx]);
});

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
