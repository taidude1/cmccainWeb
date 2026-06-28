import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { JWT_SECRET } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  let stored;
  try {
    stored = JSON.parse(readFileSync('./data/users.json', 'utf8'));
  } catch {
    return res.status(500).json({ error: 'Server not configured. Run: npm run setup' });
  }

  if (!stored.username || username !== stored.username) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, stored.hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username });
});

export default router;
