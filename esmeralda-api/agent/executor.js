import db from '../db.js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const VAULT_PATH = process.env.OBSIDIAN_VAULT || '/opt/esmeralda-vault';

function listVaultFiles(folder = '') {
  const base = folder ? join(VAULT_PATH, folder) : VAULT_PATH;
  try {
    const items = readdirSync(base);
    const result = [];
    for (const item of items) {
      if (item.startsWith('.')) continue;
      const full = join(base, item);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        result.push({ type: 'folder', name: item, path: relative(VAULT_PATH, full) });
      } else if (item.endsWith('.md')) {
        result.push({ type: 'file', name: item, path: relative(VAULT_PATH, full), size: stat.size });
      }
    }
    return result;
  } catch (err) {
    return { error: err.message };
  }
}

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
      return {
        clients,
        tasks: {
          urgente: tasks.filter(t => t.type === 'urgente'),
          hoje: tasks.filter(t => t.type === 'hoje')
        },
        projects, milestones, pendencias,
        summary: { totalRevenue, saasRevenue }
      };
    }
    case 'create_task': {
      if (input.type === 'hoje') {
        const count = db.prepare("SELECT COUNT(*) as n FROM tasks WHERE type = 'hoje' AND done = 0").get().n;
        if (count >= 3) return { error: 'Máximo 3 tarefas no Hoje. Precisa tirar uma antes.' };
      }
      const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) as m FROM tasks WHERE type = ?').get(input.type).m;
      const result = db.prepare('INSERT INTO tasks (title, subtitle, category, type, client_id, position) VALUES (?, ?, ?, ?, ?, ?)').run(
        input.title, input.subtitle || null, input.category || 'geral', input.type, input.client_id || null, maxPos + 1
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
    case 'list_obsidian': {
      return listVaultFiles(input.folder || '');
    }
    case 'read_obsidian': {
      try {
        const safePath = input.path.replace(/\.\./g, '');
        const full = join(VAULT_PATH, safePath);
        if (!full.startsWith(VAULT_PATH)) return { error: 'invalid path' };
        const content = readFileSync(full, 'utf-8');
        return { path: safePath, content };
      } catch (err) {
        return { error: err.message };
      }
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
