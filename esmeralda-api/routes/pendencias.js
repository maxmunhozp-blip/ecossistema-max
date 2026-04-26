import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/pendencias', (req, res) => {
  res.json(db.prepare('SELECT * FROM pendencias ORDER BY position').all());
});

router.patch('/pendencias/:id', (req, res) => {
  const { done } = req.body;
  db.prepare('UPDATE pendencias SET done = ? WHERE id = ?').run(done ? 1 : 0, req.params.id);
  res.json(db.prepare('SELECT * FROM pendencias WHERE id = ?').get(req.params.id));
});

export default router;
