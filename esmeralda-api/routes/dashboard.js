import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/dashboard', (req, res) => {
  const clients = db.prepare('SELECT * FROM clients ORDER BY revenue DESC').all();
  const tasks = db.prepare('SELECT * FROM tasks WHERE done = 0 ORDER BY position').all();
  const projects = db.prepare('SELECT * FROM projects').all();
  const milestones = db.prepare('SELECT * FROM milestones ORDER BY position').all();
  const pendencias = db.prepare('SELECT * FROM pendencias ORDER BY position').all();

  const totalRevenue = clients.reduce((sum, c) => sum + c.revenue, 0);
  const saasRevenue = projects.reduce((sum, p) => sum + (p.clients_count * p.price), 0);

  res.json({
    clients,
    tasks: {
      urgente: tasks.filter(t => t.type === 'urgente'),
      hoje: tasks.filter(t => t.type === 'hoje'),
    },
    projects,
    milestones,
    pendencias,
    summary: { totalRevenue, saasRevenue }
  });
});

export default router;
