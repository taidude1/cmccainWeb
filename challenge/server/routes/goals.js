import { Router } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const PATH = './data/goals.json';

function read() { return JSON.parse(readFileSync(PATH, 'utf8')); }
function write(data) { writeFileSync(PATH, JSON.stringify(data, null, 2)); }

// Public — anyone can view goals
router.get('/', (req, res) => {
  res.json(read());
});

// Auth — add a new goal
router.post('/', requireAuth, (req, res) => {
  const { title, description } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });

  const goal = {
    id: randomUUID(),
    title: title.trim(),
    description: description?.trim() || '',
    selfProgress: 0,
    judgeProgress: 0,
    judgeComment: '',
    createdAt: new Date().toISOString()
  };
  const goals = read();
  goals.push(goal);
  write(goals);
  res.status(201).json(goal);
});

// Auth — update a goal's progress, judge score, etc.
router.put('/:id', requireAuth, (req, res) => {
  const goals = read();
  const idx = goals.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Goal not found' });

  const { title, description, selfProgress, judgeProgress, judgeComment } = req.body;
  const clamp = (v) => Math.max(0, Math.min(100, Number(v)));

  goals[idx] = {
    ...goals[idx],
    ...(title !== undefined && { title: title.trim() }),
    ...(description !== undefined && { description: description.trim() }),
    ...(selfProgress !== undefined && { selfProgress: clamp(selfProgress) }),
    ...(judgeProgress !== undefined && { judgeProgress: clamp(judgeProgress) }),
    ...(judgeComment !== undefined && { judgeComment }),
  };
  write(goals);
  res.json(goals[idx]);
});

// Auth — delete a goal
router.delete('/:id', requireAuth, (req, res) => {
  const goals = read();
  const filtered = goals.filter(g => g.id !== req.params.id);
  if (filtered.length === goals.length) return res.status(404).json({ error: 'Goal not found' });
  write(filtered);
  res.json({ success: true });
});

export default router;
