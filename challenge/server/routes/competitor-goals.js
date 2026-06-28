import { Router } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import { computeProgress } from '../utils/algorithms.js';

const router = Router();
const PATH = './data/competitor-goals.json';

const PACE_MULT = { ahead: 1.15, 'on-track': 1.0, behind: 0.80, struggling: 0.50 };
const VALID_PACES = Object.keys(PACE_MULT);
const VALID_MAJORS = ['finance', 'cs', 'engineering'];

function read() { return JSON.parse(readFileSync(PATH, 'utf8')); }
function write(data) { writeFileSync(PATH, JSON.stringify(data, null, 2)); }

// Pre-compute progress for all three majors once per request (not per goal)
function majorProgressMap() {
  return {
    finance:     Math.round(computeProgress('finance')     * 100),
    cs:          Math.round(computeProgress('cs')          * 100),
    engineering: Math.round(computeProgress('engineering') * 100),
  };
}

// Public — everyone can see competitor goals + their live progress
router.get('/', (req, res) => {
  const goals = read();
  const progress = majorProgressMap();

  const withProgress = goals.map(g => ({
    ...g,
    currentProgress: Math.min(100, Math.round(progress[g.major] * (PACE_MULT[g.pace] ?? 1.0)))
  }));

  res.json(withProgress);
});

// Auth — add a competitor goal
router.post('/', requireAuth, (req, res) => {
  const { major, title, description, pace = 'on-track' } = req.body;

  if (!VALID_MAJORS.includes(major)) return res.status(400).json({ error: 'Invalid major' });
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });
  if (!VALID_PACES.includes(pace)) return res.status(400).json({ error: 'Invalid pace' });

  const goal = { id: randomUUID(), major, title: title.trim(), description: description?.trim() || '', pace };
  const goals = read();
  goals.push(goal);
  write(goals);

  const progress = majorProgressMap();
  res.status(201).json({
    ...goal,
    currentProgress: Math.min(100, Math.round(progress[major] * PACE_MULT[pace]))
  });
});

// Auth — update title, description, or pace
router.put('/:id', requireAuth, (req, res) => {
  const goals = read();
  const idx = goals.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Goal not found' });

  const { title, description, pace } = req.body;
  if (pace && !VALID_PACES.includes(pace)) return res.status(400).json({ error: 'Invalid pace' });

  goals[idx] = {
    ...goals[idx],
    ...(title !== undefined && { title: title.trim() }),
    ...(description !== undefined && { description: description.trim() }),
    ...(pace !== undefined && { pace }),
  };
  write(goals);

  const progress = majorProgressMap();
  res.json({
    ...goals[idx],
    currentProgress: Math.min(100, Math.round(progress[goals[idx].major] * PACE_MULT[goals[idx].pace]))
  });
});

// Auth — delete
router.delete('/:id', requireAuth, (req, res) => {
  const goals = read();
  const filtered = goals.filter(g => g.id !== req.params.id);
  if (filtered.length === goals.length) return res.status(404).json({ error: 'Goal not found' });
  write(filtered);
  res.json({ success: true });
});

export default router;
