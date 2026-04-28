import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'esmeralda.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

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
    client_id INTEGER,
    done INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    project_id INTEGER,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
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

  CREATE TABLE IF NOT EXISTS kv (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Migrations
try { db.prepare('SELECT client_id FROM tasks LIMIT 1').get(); }
catch { db.exec('ALTER TABLE tasks ADD COLUMN client_id INTEGER REFERENCES clients(id)'); }

try { db.prepare('SELECT project_id FROM tasks LIMIT 1').get(); }
catch { db.exec('ALTER TABLE tasks ADD COLUMN project_id INTEGER REFERENCES projects(id)'); }

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

  const insertTask = db.prepare('INSERT INTO tasks (title, subtitle, category, type, client_id, position) VALUES (?, ?, ?, ?, ?, ?)');
  insertTask.run('Cobrar Gustavo — CNPJ novo', 'Nota fria pro Grupo Expo. Risco fiscal.', 'empresa', 'urgente', 1, 0);
  insertTask.run('Postar Reels Tojiro Mooca', null, 'agencia', 'hoje', 3, 0);
  insertTask.run('Ligar Amanda — CorretorIA', null, 'foguete', 'hoje', null, 1);
  insertTask.run('Msg pro Gustavo', null, 'empresa', 'hoje', null, 2);

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
