import express from 'express';
import cors from 'cors';
import dashboardRoutes from './routes/dashboard.js';
import taskRoutes from './routes/tasks.js';
import clientRoutes from './routes/clients.js';
import milestoneRoutes from './routes/milestones.js';
import pendenciaRoutes from './routes/pendencias.js';
import chatRoutes from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 4100;
const AUTH_TOKEN = process.env.ESMERALDA_TOKEN || 'esmeralda-max-2026';

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api', (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token !== AUTH_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

app.use('/api', dashboardRoutes);
app.use('/api', taskRoutes);
app.use('/api', clientRoutes);
app.use('/api', milestoneRoutes);
app.use('/api', pendenciaRoutes);
app.use('/api', chatRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Esmeralda API running on port ${PORT}`));

export default app;
