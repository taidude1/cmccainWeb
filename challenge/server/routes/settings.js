import { Router } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const PATH = './data/settings.json';

function read() { return JSON.parse(readFileSync(PATH, 'utf8')); }
function write(d) { writeFileSync(PATH, JSON.stringify(d, null, 2)); }

router.get('/', (req, res) => res.json(read()));

router.put('/', requireAdmin, (req, res) => {
  const data = read();
  if (req.body.weeklyContext !== undefined) data.weeklyContext = req.body.weeklyContext;
  write(data);
  res.json(data);
});

export default router;
