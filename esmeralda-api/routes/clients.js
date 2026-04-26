import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/clients', (req, res) => {
  res.json(db.prepare('SELECT * FROM clients ORDER BY revenue DESC').all());
});

router.patch('/clients/:id', (req, res) => {
  const { name, revenue, alert, notes } = req.body;
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!client) return res.status(404).json({ error: 'not found' });

  db.prepare(`UPDATE clients SET
    name = COALESCE(?, name),
    revenue = COALESCE(?, revenue),
    alert = COALESCE(?, alert),
    notes = COALESCE(?, notes),
    updated_at = datetime('now')
    WHERE id = ?`).run(name ?? null, revenue ?? null, alert ?? null, notes ?? null, req.params.id);
  res.json(db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id));
});

export default router;
