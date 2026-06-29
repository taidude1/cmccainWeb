import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, writeFileSync } from 'fs';
import authRoutes          from './routes/auth.js';
import goalsRoutes         from './routes/goals.js';
import algorithmsRoutes    from './routes/algorithms.js';
import competitorRoutes    from './routes/competitor-goals.js';
import researchRoutes      from './routes/research.js';
import punishmentsRoutes   from './routes/punishments.js';
import settingsRoutes      from './routes/settings.js';
import projectsRoutes      from './routes/projects.js';
import statsRoutes         from './routes/stats.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Seed any missing data files so the server starts cleanly on a fresh clone
const SEEDS = {
  './data/goals.json':      '[]',
  './data/punishments.json':'[]',
  './data/projects.json':   '[]',
  './data/research.json':   JSON.stringify({
    connor:  { label: "Connor's Weekly Progress", value: 0 },
    jack:    { label: "Jack's Weekly Progress",   value: 0 },
    overall: { label: "Overall Research Progress", value: 0 },
  }, null, 2),
  './data/settings.json':   JSON.stringify({
    weeklyContext: '',
    barLabels: {
      connorBarA: 'Competitor Avg (Finance / CS / Eng)',
      connorBarB: "Connor's Goal Avg",
    },
  }, null, 2),
};

for (const [path, content] of Object.entries(SEEDS)) {
  if (!existsSync(path)) {
    writeFileSync(path, content);
    console.log(`Created missing data file: ${path}`);
  }
}

const app  = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, cb) => (!origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error('CORS')))
}));
app.use(express.json({ limit: '5mb' }));

app.use('/api/auth',             authRoutes);
app.use('/api/goals',            goalsRoutes);
app.use('/api/algorithms',       algorithmsRoutes);
app.use('/api/competitor-goals', competitorRoutes);
app.use('/api/research',         researchRoutes);
app.use('/api/punishments',      punishmentsRoutes);
app.use('/api/settings',         settingsRoutes);
app.use('/api/projects',         projectsRoutes);
app.use('/api/stats',            statsRoutes);

app.use(express.static(join(__dirname, '../client/dist')));
app.get('*', (req, res) => res.sendFile(join(__dirname, '../client/dist/index.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Challenge server → http://localhost:${PORT}`);
});
