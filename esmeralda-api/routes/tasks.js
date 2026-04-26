import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/tasks', (req, res) => {
  const type = req.query.type;
  const stmt = type
    ? db.prepare('SELECT * FROM tasks WHERE type = ? ORDER BY position')
    : db.prepare('SELECT * FROM tasks ORDER BY position');
  res.json(type ? stmt.all(type) : stmt.all());
});

router.post('/tasks', (req, res) => {
  const { title, subtitle, category, type } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });

  if (type === 'hoje') {
    const count = db.prepare("SELECT COUNT(*) as n FROM tasks WHERE type = 'hoje' AND done = 0").get().n;
    if (count >= 3) return res.status(400).json({ error: 'Máximo 3 tarefas no Hoje' });
  }

  const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) as m FROM tasks WHERE type = ?').get(type || 'hoje').m;
  const result = db.prepare('INSERT INTO tasks (title, subtitle, category, type, position) VALUES (?, ?, ?, ?, ?)').run(
    title, subtitle || null, category || 'geral', type || 'hoje', maxPos + 1
  );
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(task);
});

router.patch('/tasks/:id', (req, res) => {
  const { title, subtitle, category, type, done } = req.body;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'not found' });

  db.prepare(`UPDATE tasks SET
    title = COALESCE(?, title),
    subtitle = COALESCE(?, subtitle),
    category = COALESCE(?, category),
    type = COALESCE(?, type),
    done = COALESCE(?, done),
    updated_at = datetime('now')
    WHERE id = ?`).run(
    title ?? null, subtitle ?? null, category ?? null, type ?? null, done ?? null, req.params.id
  );
  res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id));
});

router.delete('/tasks/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
