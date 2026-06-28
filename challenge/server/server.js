import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import goalsRoutes from './routes/goals.js';
import algorithmsRoutes from './routes/algorithms.js';
import competitorGoalsRoutes from './routes/competitor-goals.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Allow origins: set ALLOWED_ORIGINS env var in production (comma-separated)
// e.g. ALLOWED_ORIGINS=https://challenge.yourdomain.com
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, mobile apps) or matching origins
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/algorithms', algorithmsRoutes);
app.use('/api/competitor-goals', competitorGoalsRoutes);

// Serve built React client (run `npm run build` inside challenge/client first)
app.use(express.static(join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Challenge server → http://localhost:${PORT}`);
  console.log(`Friends on LAN  → http://<your-ip>:${PORT}`);
});
