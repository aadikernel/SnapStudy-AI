import { Router } from 'express';
import { stats } from '../stats.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(stats.get());
});

router.post('/note', (req, res) => {
  stats.notes++;
  stats.addActivity('Saved notes');
  res.json({ ok: true });
});

export default router;
