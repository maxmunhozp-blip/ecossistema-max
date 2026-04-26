import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/projects', (req, res) => {
  res.json(db.prepare('SELECT * FROM projects').all());
});

router.patch('/projects/:id', (req, res) => {
  const { clients_count, status, notes } = req.body;
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'not found' });

  db.prepare(`UPDATE projects SET
    clients_count = COALESCE(?, clients_count),
    status = COALESCE(?, status),
    notes = COALESCE(?, notes),
    updated_at = datetime('now')
    WHERE id = ?`).run(clients_count ?? null, status ?? null, notes ?? null, req.params.id);
  res.json(db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id));
});

router.get('/projects/:id/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY done ASC, position ASC').all(req.params.id);
  res.json(tasks);
});

router.post('/projects/:id/tasks', (req, res) => {
  const { title, subtitle } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'project not found' });

  const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) as m FROM tasks WHERE project_id = ?').get(req.params.id).m;
  const result = db.prepare('INSERT INTO tasks (title, subtitle, category, type, project_id, position) VALUES (?, ?, ?, ?, ?, ?)').run(
    title, subtitle || null, 'foguete', 'backlog', req.params.id, maxPos + 1
  );
  res.status(201).json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid));
});

export default router;
