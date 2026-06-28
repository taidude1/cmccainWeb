import { Router } from 'express';
import { computeProgress } from '../utils/algorithms.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    finance:     Math.round(computeProgress('finance')     * 100),
    cs:          Math.round(computeProgress('cs')          * 100),
    engineering: Math.round(computeProgress('engineering') * 100),
  });
});

export default router;
