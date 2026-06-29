import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { JWT_SECRET } from '../middleware/auth.js';

const router = Router();

function readUsers() {
  const raw = JSON.parse(readFileSync('./data/users.json', 'utf8'));
  // Handle old single-object format (auto-migrate to admin)
  if (!Array.isArray(raw)) return raw.username ? [{ ...raw, role: 'admin' }] : [];
  return raw;
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  let users;
  try { users = readUsers(); }
  catch { return res.status(500).json({ error: 'Server not configured. Run: npm run setup' }); }

  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '14d' });
  res.json({ token, username: user.username, role: user.role });
});

export default router;
