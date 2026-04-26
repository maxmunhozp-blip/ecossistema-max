import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/milestones', (req, res) => {
  res.json(db.prepare('SELECT * FROM milestones ORDER BY position').all());
});

router.patch('/milestones/:id', (req, res) => {
  const { done } = req.body;
  db.prepare('UPDATE milestones SET done = ? WHERE id = ?').run(done ? 1 : 0, req.params.id);
  res.json(db.prepare('SELECT * FROM milestones WHERE id = ?').get(req.params.id));
});

export default router;
