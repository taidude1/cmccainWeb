import { Router } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const PATH = './data/research.json';

function read() { return JSON.parse(readFileSync(PATH, 'utf8')); }
function write(d) { writeFileSync(PATH, JSON.stringify(d, null, 2)); }

const VALID_KEYS = ['connor', 'jack', 'overall'];

router.get('/', (req, res) => res.json(read()));

router.put('/:key', requireAuth, (req, res) => {
  const { key } = req.params;
  if (!VALID_KEYS.includes(key)) return res.status(400).json({ error: 'Invalid key' });

  const { role } = req.user;
  if (role !== 'admin' && !(role === 'challenge' && key === 'jack')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const data = read();
  // value is optional — label-only updates are allowed for admin
  if (req.body.value !== undefined) {
    data[key].value = Math.max(0, Math.min(100, Number(req.body.value)));
  }
  if (req.body.label !== undefined && role === 'admin') {
    data[key].label = req.body.label;
  }
  write(data);
  res.json(data);
});

export default router;
