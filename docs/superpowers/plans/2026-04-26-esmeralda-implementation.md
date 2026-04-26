# Esmeralda Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Esmeralda dashboard — a personal online panel with AI chat agent, hosted at tracktor.com.br/esmeralda (frontend) with API on VPS 76.13.172.151.

**Architecture:** Static HTML/CSS/JS frontend talks to a Node.js + SQLite REST API on the VPS. Chat uses Claude API with function calling to read/write the database. Frontend deploys via FTP to Hostinger, API deploys via SCP to VPS.

**Tech Stack:** Node.js, Express, better-sqlite3, @anthropic-ai/sdk, vanilla HTML/CSS/JS, Lucide icons

---

## File Structure

### Backend (`esmeralda-api/`)

```
esmeralda-api/
  package.json
  server.js              — Express server, CORS, auth middleware, route mounting
  db.js                  — SQLite connection + schema init + seed
  routes/
    dashboard.js         — GET /api/dashboard (aggregated view)
    tasks.js             — CRUD for tasks (hoje + urgências)
    clients.js           — CRUD for agency clients
    milestones.js        — CRUD for milestones
    pendencias.js        — CRUD for pendências
    chat.js              — POST /api/chat (Claude API + function calling + streaming)
  agent/
    system-prompt.js     — System prompt for the AI agent
    tools.js             — Tool definitions for function calling
    executor.js          — Executes tool calls against the database
  test/
    api.test.js          �� API endpoint tests
```

### Frontend (`esmeralda/`)

```
esmeralda/
  index.html             — Main dashboard page (sidebar + grid + chat)
  style.css              — Neutro quente theme, all components
  app.js                 — Fetch data, render cards, chat logic, interactions
```

---

### Task 1: Backend — Project setup, database schema, seed data

**Files:**
- Create: `esmeralda-api/package.json`
- Create: `esmeralda-api/db.js`

- [ ] **Step 1: Create project directory and package.json**

```bash
mkdir -p /Users/maxmunhoz/Projects/ecossistema-max/esmeralda-api
```

Create `esmeralda-api/package.json`:
```json
{
  "name": "esmeralda-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "test": "node --test test/api.test.js"
  },
  "dependencies": {
    "express": "^4.21.0",
    "better-sqlite3": "^11.7.0",
    "cors": "^2.8.5",
    "@anthropic-ai/sdk": "^0.39.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/maxmunhoz/Projects/ecossistema-max/esmeralda-api && npm install
```

- [ ] **Step 3: Create db.js with schema + seed**

Create `esmeralda-api/db.js`:
```js
import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'esmeralda.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    revenue REAL NOT NULL DEFAULT 0,
    type TEXT NOT NULL DEFAULT 'agencia',
    alert TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT,
    category TEXT NOT NULL DEFAULT 'geral',
    type TEXT NOT NULL DEFAULT 'hoje',
    done INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    clients_count INTEGER NOT NULL DEFAULT 0,
    clients_goal INTEGER NOT NULL DEFAULT 50,
    price REAL NOT NULL DEFAULT 169,
    partner_name TEXT,
    partner_split REAL NOT NULL DEFAULT 40,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    value TEXT,
    done INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pendencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Seed only if empty
const count = db.prepare('SELECT COUNT(*) as n FROM clients').get().n;
if (count === 0) {
  const insertClient = db.prepare('INSERT INTO clients (name, revenue, type, alert) VALUES (?, ?, ?, ?)');
  insertClient.run('Grupo Expo', 7000, 'agencia', 'Nota fria — CNPJ pendente');
  insertClient.run('Centurião', 3200, 'agencia', null);
  insertClient.run('Tojiro Mooca', 2200, 'agencia', null);
  insertClient.run('Tojiro Zona Norte', 1500, 'agencia', null);
  insertClient.run('Mecânica Primus', 690, 'agencia', null);
  insertClient.run('Poeticamente', 500, 'agencia', null);

  const insertProject = db.prepare('INSERT INTO projects (name, slug, status, clients_count, clients_goal, price, partner_name, partner_split) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  insertProject.run('AdvocaciaIA', 'advocaciaia', 'active', 1, 50, 169, 'Dra. Daiane', 40);
  insertProject.run('CorretorIA', 'corretoria', 'development', 0, 50, 169, 'Amanda Miranda', 40);

  const insertTask = db.prepare('INSERT INTO tasks (title, subtitle, category, type, position) VALUES (?, ?, ?, ?, ?)');
  insertTask.run('Cobrar Gustavo — CNPJ novo', 'Nota fria pro Grupo Expo. Risco fiscal.', 'empresa', 'urgente', 0);
  insertTask.run('Postar Reels Tojiro Mooca', null, 'agencia', 'hoje', 0);
  insertTask.run('Ligar Amanda — AdvocaciaIA', null, 'foguete', 'hoje', 1);
  insertTask.run('Msg pro Gustavo', null, 'empresa', 'hoje', 2);

  const insertMilestone = db.prepare('INSERT INTO milestones (title, value, position) VALUES (?, ?, ?)');
  insertMilestone.run('AdvocaciaIA: 5 clientes', 'R$845', 0);
  insertMilestone.run('CorretorIA: MVP pronto', null, 1);
  insertMilestone.run('R$3k/mês dos SaaS', 'respira', 2);
  insertMilestone.run('R$8k+/mês dos SaaS', 'sai da agência', 3);

  const insertPend = db.prepare('INSERT INTO pendencias (title, position) VALUES (?, ?)');
  insertPend.run('CNPJ novo (Gustavo)', 0);
  insertPend.run('CNPJ AdvocaciaIA', 1);
  insertPend.run('CNPJ CorretorIA', 2);
  insertPend.run('Contrato AdvocaciaIA + Daiane', 3);
  insertPend.run('Contrato CorretorIA + Amanda', 4);
  insertPend.run('Definir split final (60/40?)', 5);
}

export default db;
```

- [ ] **Step 4: Test database initializes correctly**

```bash
cd /Users/maxmunhoz/Projects/ecossistema-max/esmeralda-api && node -e "import('./db.js').then(m => { const db = m.default; console.log('clients:', db.prepare('SELECT COUNT(*) as n FROM clients').get().n); console.log('tasks:', db.prepare('SELECT COUNT(*) as n FROM tasks').get().n); console.log('OK'); })"
```

Expected: `clients: 6`, `tasks: 4`, `OK`

- [ ] **Step 5: Commit**

```bash
cd /Users/maxmunhoz/Projects/ecossistema-max && git add esmeralda-api/package.json esmeralda-api/package-lock.json esmeralda-api/db.js && git commit -m "feat(esmeralda): database schema + seed data"
```

---

### Task 2: Backend — Express server + API routes

**Files:**
- Create: `esmeralda-api/server.js`
- Create: `esmeralda-api/routes/dashboard.js`
- Create: `esmeralda-api/routes/tasks.js`
- Create: `esmeralda-api/routes/clients.js`
- Create: `esmeralda-api/routes/milestones.js`
- Create: `esmeralda-api/routes/pendencias.js`

- [ ] **Step 1: Create server.js**

```js
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

// Auth middleware
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
```

- [ ] **Step 2: Create routes/dashboard.js**

```js
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
```

- [ ] **Step 3: Create routes/tasks.js**

```js
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

  // Enforce max 3 for "hoje"
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
```

- [ ] **Step 4: Create routes/clients.js**

```js
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
```

- [ ] **Step 5: Create routes/milestones.js**

```js
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
```

- [ ] **Step 6: Create routes/pendencias.js**

```js
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
```

- [ ] **Step 7: Create placeholder routes/chat.js**

```js
import { Router } from 'express';
const router = Router();

router.post('/chat', (req, res) => {
  res.json({ message: 'Chat not implemented yet' });
});

export default router;
```

- [ ] **Step 8: Test server starts and responds**

```bash
cd /Users/maxmunhoz/Projects/ecossistema-max/esmeralda-api && timeout 5 node -e "
import('./server.js').then(async () => {
  await new Promise(r => setTimeout(r, 1000));
  const res = await fetch('http://localhost:4100/health');
  const data = await res.json();
  console.log('health:', data.status);
  const dash = await fetch('http://localhost:4100/api/dashboard', { headers: { Authorization: 'Bearer esmeralda-max-2026' }});
  const d = await dash.json();
  console.log('clients:', d.clients.length, 'tasks:', d.tasks.urgente.length + d.tasks.hoje.length);
  process.exit(0);
});
" || true
```

Expected: `health: ok`, `clients: 6 tasks: 4`

- [ ] **Step 9: Commit**

```bash
cd /Users/maxmunhoz/Projects/ecossistema-max && git add esmeralda-api/server.js esmeralda-api/routes/ && git commit -m "feat(esmeralda): Express API with all REST endpoints"
```

---

### Task 3: Backend — AI Agent (Claude API + function calling)

**Files:**
- Create: `esmeralda-api/agent/system-prompt.js`
- Create: `esmeralda-api/agent/tools.js`
- Create: `esmeralda-api/agent/executor.js`
- Modify: `esmeralda-api/routes/chat.js`

- [ ] **Step 1: Create agent/system-prompt.js**

```js
export const SYSTEM_PROMPT = `Você é o Esmeralda, assistente pessoal do Max Munhoz.

## Quem é Max
- Dono de agência de marketing digital (R$15.090/mês de receita)
- Tem TDAH — precisa de respostas diretas, sem enrolação
- Está construindo 2 SaaS: AdvocaciaIA (com Daiane, 60/40) e CorretorIA (com Amanda, 60/40)
- Objetivo: sair da agência quando SaaS der R$8k+/mês limpo

## Como se comportar
- Português brasileiro informal, direto, sem emojis
- Nunca dê 10 opções — dê 1 recomendação clara
- Quebre tudo em passos pequenos (15 min cada)
- Quando Max voltar depois de um tempo, situe ele ("onde você parou")
- Sem julgamento por pausas longas
- Quando modificar dados, diga exatamente o que mudou

## O que você pode fazer
Você tem acesso a ferramentas para ler e modificar os dados do painel:
- Listar/criar/editar tarefas (hoje e urgências)
- Ver/atualizar dados dos clientes da agência
- Ver marcos e progresso dos SaaS
- Ver/marcar pendências de empresa

Sempre use as ferramentas quando o Max pedir pra mudar algo. Não diga "vou anotar" — faça a mudan��a direto.

## Regras
- "Hoje" tem máximo 3 tarefas — se Max pedir uma 4a, pergunte qual tirar
- Urgências são só pra coisas que precisam de ação HOJE
- Ao organizar o dia, coloque tarefas rápidas primeiro (momentum pra TDAH)
`;
```

- [ ] **Step 2: Create agent/tools.js**

```js
export const TOOLS = [
  {
    name: 'get_dashboard',
    description: 'Busca todos os dados do painel: clientes, tarefas, projetos, marcos e pendências',
    input_schema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'create_task',
    description: 'Cria uma nova tarefa. type pode ser "hoje" (máx 3) ou "urgente". category: agencia, foguete, empresa, geral',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Título da tarefa' },
        subtitle: { type: 'string', description: 'Descrição opcional' },
        category: { type: 'string', enum: ['agencia', 'foguete', 'empresa', 'geral'] },
        type: { type: 'string', enum: ['hoje', 'urgente'] }
      },
      required: ['title', 'type']
    }
  },
  {
    name: 'update_task',
    description: 'Atualiza uma tarefa existente. Pode marcar como done, mudar título, tipo, etc.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ID da tarefa' },
        title: { type: 'string' },
        subtitle: { type: 'string' },
        category: { type: 'string' },
        type: { type: 'string', enum: ['hoje', 'urgente'] },
        done: { type: 'number', enum: [0, 1] }
      },
      required: ['id']
    }
  },
  {
    name: 'delete_task',
    description: 'Remove uma tarefa',
    input_schema: {
      type: 'object',
      properties: { id: { type: 'number' } },
      required: ['id']
    }
  },
  {
    name: 'update_client',
    description: 'Atualiza dados de um cliente da agência (nome, receita, alerta)',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        revenue: { type: 'number' },
        alert: { type: 'string' }
      },
      required: ['id']
    }
  },
  {
    name: 'toggle_pendencia',
    description: 'Marca/desmarca uma pendência como feita',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        done: { type: 'number', enum: [0, 1] }
      },
      required: ['id', 'done']
    }
  },
  {
    name: 'toggle_milestone',
    description: 'Marca/desmarca um marco como atingido',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        done: { type: 'number', enum: [0, 1] }
      },
      required: ['id', 'done']
    }
  }
];
```

- [ ] **Step 3: Create agent/executor.js**

```js
import db from '../db.js';

export function executeTool(name, input) {
  switch (name) {
    case 'get_dashboard': {
      const clients = db.prepare('SELECT * FROM clients ORDER BY revenue DESC').all();
      const tasks = db.prepare('SELECT * FROM tasks WHERE done = 0 ORDER BY position').all();
      const projects = db.prepare('SELECT * FROM projects').all();
      const milestones = db.prepare('SELECT * FROM milestones ORDER BY position').all();
      const pendencias = db.prepare('SELECT * FROM pendencias ORDER BY position').all();
      const totalRevenue = clients.reduce((sum, c) => sum + c.revenue, 0);
      const saasRevenue = projects.reduce((sum, p) => sum + (p.clients_count * p.price), 0);
      return { clients, tasks: { urgente: tasks.filter(t => t.type === 'urgente'), hoje: tasks.filter(t => t.type === 'hoje') }, projects, milestones, pendencias, summary: { totalRevenue, saasRevenue } };
    }
    case 'create_task': {
      if (input.type === 'hoje') {
        const count = db.prepare("SELECT COUNT(*) as n FROM tasks WHERE type = 'hoje' AND done = 0").get().n;
        if (count >= 3) return { error: 'Máximo 3 tarefas no Hoje. Precisa tirar uma antes.' };
      }
      const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) as m FROM tasks WHERE type = ?').get(input.type).m;
      const result = db.prepare('INSERT INTO tasks (title, subtitle, category, type, position) VALUES (?, ?, ?, ?, ?)').run(
        input.title, input.subtitle || null, input.category || 'geral', input.type, maxPos + 1
      );
      return db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    }
    case 'update_task': {
      const { id, ...fields } = input;
      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
      if (!task) return { error: 'Tarefa não encontrada' };
      db.prepare(`UPDATE tasks SET title = COALESCE(?, title), subtitle = COALESCE(?, subtitle), category = COALESCE(?, category), type = COALESCE(?, type), done = COALESCE(?, done), updated_at = datetime('now') WHERE id = ?`).run(
        fields.title ?? null, fields.subtitle ?? null, fields.category ?? null, fields.type ?? null, fields.done ?? null, id
      );
      return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    }
    case 'delete_task': {
      db.prepare('DELETE FROM tasks WHERE id = ?').run(input.id);
      return { ok: true };
    }
    case 'update_client': {
      const { id, ...fields } = input;
      db.prepare(`UPDATE clients SET name = COALESCE(?, name), revenue = COALESCE(?, revenue), alert = COALESCE(?, alert), updated_at = datetime('now') WHERE id = ?`).run(
        fields.name ?? null, fields.revenue ?? null, fields.alert ?? null, id
      );
      return db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    }
    case 'toggle_pendencia': {
      db.prepare('UPDATE pendencias SET done = ? WHERE id = ?').run(input.done, input.id);
      return db.prepare('SELECT * FROM pendencias WHERE id = ?').get(input.id);
    }
    case 'toggle_milestone': {
      db.prepare('UPDATE milestones SET done = ? WHERE id = ?').run(input.done, input.id);
      return db.prepare('SELECT * FROM milestones WHERE id = ?').get(input.id);
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
```

- [ ] **Step 4: Update routes/chat.js with Claude API + streaming**

Replace `esmeralda-api/routes/chat.js`:
```js
import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import db from '../db.js';
import { SYSTEM_PROMPT } from '../agent/system-prompt.js';
import { TOOLS } from '../agent/tools.js';
import { executeTool } from '../agent/executor.js';

const router = Router();
const client = new Anthropic();

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  // Save user message
  db.prepare('INSERT INTO chat_messages (role, content) VALUES (?, ?)').run('user', message);

  // Get recent history (last 20 messages)
  const history = db.prepare('SELECT role, content FROM chat_messages ORDER BY id DESC LIMIT 20').all().reverse();

  const messages = history.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));

  try {
    // Agentic loop: keep calling Claude until no more tool_use
    let currentMessages = [...messages];
    let finalText = '';
    let toolActions = [];

    for (let i = 0; i < 5; i++) { // max 5 tool rounds
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        messages: currentMessages
      });

      const textBlocks = response.content.filter(b => b.type === 'text');
      const toolBlocks = response.content.filter(b => b.type === 'tool_use');

      if (textBlocks.length > 0) {
        finalText += textBlocks.map(b => b.text).join('');
      }

      if (toolBlocks.length === 0) break; // No more tools, done

      // Execute tools and build tool_result messages
      const toolResults = [];
      for (const tool of toolBlocks) {
        const result = executeTool(tool.name, tool.input);
        toolActions.push({ tool: tool.name, input: tool.input, result });
        toolResults.push({
          type: 'tool_result',
          tool_use_id: tool.id,
          content: JSON.stringify(result)
        });
      }

      // Add assistant response + tool results to messages for next round
      currentMessages = [
        ...currentMessages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults }
      ];
    }

    // Save assistant response
    if (finalText) {
      db.prepare('INSERT INTO chat_messages (role, content) VALUES (?, ?)').run('assistant', finalText);
    }

    res.json({
      message: finalText,
      actions: toolActions.map(a => ({ tool: a.tool, description: describeAction(a) }))
    });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Erro no chat. Tente novamente.' });
  }
});

function describeAction(action) {
  const map = {
    get_dashboard: 'Li os dados do painel',
    create_task: `Criei tarefa: "${action.input.title}"`,
    update_task: 'Atualizei tarefa',
    delete_task: 'Removi tarefa',
    update_client: `Atualizei cliente`,
    toggle_pendencia: 'Atualizei pendência',
    toggle_milestone: 'Atualizei marco'
  };
  return map[action.tool] || action.tool;
}

export default router;
```

- [ ] **Step 5: Commit**

```bash
cd /Users/maxmunhoz/Projects/ecossistema-max && git add esmeralda-api/agent/ esmeralda-api/routes/chat.js && git commit -m "feat(esmeralda): AI agent with Claude API + function calling"
```

---

### Task 4: Frontend — Complete dashboard with chat

**Files:**
- Create: `esmeralda/index.html`
- Create: `esmeralda/style.css`
- Create: `esmeralda/app.js`

- [ ] **Step 1: Create esmeralda/index.html**

The full HTML structure: sidebar, grid of cards, chat panel. Uses Lucide icons CDN. Links to style.css and app.js. Structure matches the approved mockup exactly.

- [ ] **Step 2: Create esmeralda/style.css**

Complete CSS theme: neutro quente (#f5f4ef background, #2d2d2a text, #8b8b6e accents, #fefbf3 urgente card). All component styles from the mockup. Responsive for sidebar collapse on small screens.

- [ ] **Step 3: Create esmeralda/app.js**

JavaScript: fetch dashboard data from API, render all cards dynamically, chat send/receive, checkbox toggle, suggestions click. Config at top with API_URL and AUTH_TOKEN.

- [ ] **Step 4: Test locally**

Open `esmeralda/index.html` in browser while API is running. Verify all cards render with real data. Test chat by sending "onde eu parei?". Test checkbox toggling.

- [ ] **Step 5: Commit**

```bash
cd /Users/maxmunhoz/Projects/ecossistema-max && git add esmeralda/ && git commit -m "feat(esmeralda): complete frontend dashboard with chat"
```

---

### Task 5: Deploy — API to VPS + Frontend to Hostinger

**Files:**
- Create: `esmeralda-api/ecosystem.config.cjs` (PM2 config)
- Modify: `.github/workflows/deploy.yml` (add esmeralda deploy steps)

- [ ] **Step 1: Create PM2 config for the API**

```js
module.exports = {
  apps: [{
    name: 'esmeralda-api',
    script: 'server.js',
    cwd: '/opt/esmeralda-api',
    env: {
      PORT: 4100,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      ESMERALDA_TOKEN: 'esmeralda-max-2026'
    }
  }]
};
```

- [ ] **Step 2: Deploy API to VPS**

SCP the esmeralda-api folder to VPS, npm install, start with PM2. Configure Traefik route for `esmeralda-api.tracktor.com.br` or use existing VPS IP with port.

- [ ] **Step 3: Update deploy.yml to include esmeralda/ in FTP upload**

Add `esmeralda/` to the Hostinger FTP deploy step so it lands at `tracktor.com.br/esmeralda/`.

- [ ] **Step 4: Update frontend API_URL to point to VPS**

Set `API_URL` in app.js to the VPS endpoint.

- [ ] **Step 5: Test end-to-end**

Open `tracktor.com.br/esmeralda/` in browser. Verify dashboard loads, chat works, checkboxes toggle.

- [ ] **Step 6: Commit + push**

```bash
cd /Users/maxmunhoz/Projects/ecossistema-max && git add . && git commit -m "feat(esmeralda): deploy config for VPS + Hostinger" && git push
```

---

## Summary

| Task | What | Est. files |
|------|------|-----------|
| 1 | Database schema + seed | 2 |
| 2 | Express API + REST routes | 7 |
| 3 | AI Agent (Claude API + tools) | 4 |
| 4 | Frontend (HTML/CSS/JS) | 3 |
| 5 | Deploy (VPS + Hostinger) | 2 |
