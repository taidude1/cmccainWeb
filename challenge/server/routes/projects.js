import { Router } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const PATH = './data/projects.json';

function read() { return JSON.parse(readFileSync(PATH, 'utf8')); }
function write(d) { writeFileSync(PATH, JSON.stringify(d, null, 2)); }

// Public
router.get('/', (req, res) => res.json(read()));

// Create — admin or challenge can submit projects
router.post('/', requireAuth, (req, res) => {
  const { role, username } = req.user;
  if (role === 'viewer') return res.status(403).json({ error: 'Forbidden' });

  const { title, description = '', imageUrl = '', tags = [] } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });

  const owner = role === 'challenge' ? 'jack' : 'connor';
  const project = {
    id: randomUUID(),
    owner,
    title: title.trim(),
    description: description.trim(),
    imageUrl: imageUrl.trim(),
    tags,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    submittedBy: username,
  };

  const projects = read();
  projects.unshift(project);
  write(projects);
  res.status(201).json(project);
});

// Update — admin any, challenge own
router.put('/:id', requireAuth, (req, res) => {
  const projects = read();
  const idx = projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const { role } = req.user;
  if (role === 'viewer') return res.status(403).json({ error: 'Forbidden' });
  if (role === 'challenge' && projects[idx].owner !== 'jack') return res.status(403).json({ error: 'Forbidden' });

  const { title, description, imageUrl, tags } = req.body;
  if (title !== undefined)       projects[idx].title       = title.trim();
  if (description !== undefined) projects[idx].description = description.trim();
  if (imageUrl !== undefined)    projects[idx].imageUrl    = imageUrl.trim();
  if (tags !== undefined)        projects[idx].tags        = tags;
  write(projects);
  res.json(projects[idx]);
});

// Delete — admin any, challenge own
router.delete('/:id', requireAuth, (req, res) => {
  const projects = read();
  const target = projects.find(p => p.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Not found' });

  const { role } = req.user;
  if (role === 'viewer') return res.status(403).json({ error: 'Forbidden' });
  if (role === 'challenge' && target.owner !== 'jack') return res.status(403).json({ error: 'Forbidden' });

  write(projects.filter(p => p.id !== req.params.id));
  res.json({ success: true });
});

export default router;
