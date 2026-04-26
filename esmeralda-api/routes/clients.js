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

router.get('/clients/:id/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks WHERE client_id = ? ORDER BY done ASC, position ASC').all(req.params.id);
  res.json(tasks);
});

router.post('/clients/:id/tasks', (req, res) => {
  const { title, subtitle } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });

  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!client) return res.status(404).json({ error: 'client not found' });

  const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) as m FROM tasks WHERE client_id = ?').get(req.params.id).m;
  const result = db.prepare('INSERT INTO tasks (title, subtitle, category, type, client_id, position) VALUES (?, ?, ?, ?, ?, ?)').run(
    title, subtitle || null, 'agencia', 'backlog', req.params.id, maxPos + 1
  );
  res.status(201).json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid));
});

export default router;
