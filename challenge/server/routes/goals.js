import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const PATH = './data/goals.json';
const UPLOAD_DIR = './data/submissions';

if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safe = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_');
    cb(null, `${Date.now()}_${safe}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

function read() {
  const goals = JSON.parse(readFileSync(PATH, 'utf8'));
  return goals.map(g => ({ owner: 'connor', type: 'daily', points: 1, ...g }));
}
function write(d) { writeFileSync(PATH, JSON.stringify(d, null, 2)); }

function ownerForRole(role) {
  if (role === 'challenge') return 'jack';
  return 'connor'; // admin, connor
}

function canModify(role, goalOwner) {
  if (role === 'admin') return true;
  if (role === 'connor' && goalOwner === 'connor') return true;
  if (role === 'challenge' && goalOwner === 'jack') return true;
  return false;
}

router.get('/', (req, res) => res.json(read()));

router.post('/', requireAuth, (req, res) => {
  const { title, description = '', type = 'daily', dueDate = null, points = 1 } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });

  const { role } = req.user;
  const owner = (role === 'admin' && req.body.owner)
    ? req.body.owner
    : ownerForRole(role);

  const goal = {
    id: randomUUID(), owner,
    title: title.trim(), description: description.trim(),
    type, dueDate: dueDate || null,
    points: Math.max(1, Number(points) || 1),
    selfProgress: 0, judgeProgress: 0, judgeComment: '',
    submissionText: null, submissionFile: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
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
  if (!canModify(role, goals[idx].owner)) return res.status(403).json({ error: 'Forbidden' });

  const { title, description, selfProgress, judgeProgress, judgeComment, type, dueDate, points } = req.body;
  const clamp = v => Math.max(0, Math.min(100, Number(v)));

  if (title !== undefined)       goals[idx].title       = title.trim();
  if (description !== undefined) goals[idx].description = description.trim();
  if (judgeComment !== undefined) goals[idx].judgeComment = judgeComment;
  if (judgeProgress !== undefined) goals[idx].judgeProgress = clamp(judgeProgress);
  if (type !== undefined && role === 'admin') goals[idx].type = type;
  if (dueDate !== undefined && role === 'admin') goals[idx].dueDate = dueDate || null;
  if (points !== undefined && role === 'admin') goals[idx].points = Math.max(1, Number(points) || 1);

  if (selfProgress !== undefined) {
    const clamped = clamp(selfProgress);
    const wasComplete = goals[idx].selfProgress >= 100;
    goals[idx].selfProgress = clamped;
    if (!wasComplete && clamped >= 100 && !goals[idx].completedAt) {
      goals[idx].completedAt = new Date().toISOString();
    }
    if (clamped < 100) goals[idx].completedAt = null;
  }

  write(goals);
  res.json(goals[idx]);
});

// Submit completion: text and/or file proof
router.post('/:id/submit', requireAuth, upload.single('file'), (req, res) => {
  const goals = read();
  const idx = goals.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const { role } = req.user;
  if (!canModify(role, goals[idx].owner)) return res.status(403).json({ error: 'Forbidden' });

  goals[idx].submissionText = req.body.text || null;
  goals[idx].submissionFile = req.file ? req.file.filename : null;
  goals[idx].selfProgress   = 100;
  goals[idx].completedAt    = goals[idx].completedAt || new Date().toISOString();

  write(goals);
  res.json(goals[idx]);
});

router.delete('/:id', requireAuth, (req, res) => {
  const goals = read();
  const target = goals.find(g => g.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Not found' });

  const { role } = req.user;
  if (!canModify(role, target.owner)) return res.status(403).json({ error: 'Forbidden' });

  write(goals.filter(g => g.id !== req.params.id));
  res.json({ success: true });
});

export default router;
