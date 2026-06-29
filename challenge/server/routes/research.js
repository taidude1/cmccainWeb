import { Router } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const PATH = './data/research.json';

function read() { return JSON.parse(readFileSync(PATH, 'utf8')); }
function write(d) { writeFileSync(PATH, JSON.stringify(d, null, 2)); }

const VALID_KEYS = ['connor', 'jack', 'overall'];

// Public — anyone can view research bars
router.get('/', (req, res) => res.json(read()));

// Auth — update a bar value. Connor can update all; Jack only updates his own.
router.put('/:key', requireAuth, (req, res) => {
  const { key } = req.params;
  if (!VALID_KEYS.includes(key)) return res.status(400).json({ error: 'Invalid key' });

  const { role } = req.user;
  if (role !== 'admin' && !(role === 'challenge' && key === 'jack')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const value = Math.max(0, Math.min(100, Number(req.body.value)));
  const data = read();
  data[key].value = value;
  if (req.body.label && role === 'admin') data[key].label = req.body.label;
  write(data);
  res.json(data);
});

export default router;
