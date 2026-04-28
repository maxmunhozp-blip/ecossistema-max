import db from '../db.js';
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from 'fs';
import { join, relative, dirname } from 'path';
import { execSync } from 'child_process';

const VAULT_PATH = process.env.OBSIDIAN_VAULT || '/opt/esmeralda-vault';

function safePath(input) {
  const safe = input.replace(/\.\./g, '');
  const full = join(VAULT_PATH, safe);
  if (!full.startsWith(VAULT_PATH)) throw new Error('invalid path');
  return full;
}

function gitCommitPush(message) {
  try {
    execSync(`cd ${VAULT_PATH} && git add -A && git diff --cached --quiet || (git commit -m "${message.replace(/"/g, '\\"')}" && git push origin main)`, { stdio: 'pipe' });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

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
        const full = safePath(input.path);
        const content = readFileSync(full, 'utf-8');
        return { path: input.path, content };
      } catch (err) {
        return { error: err.message };
      }
    }
    case 'append_obsidian': {
      try {
        const full = safePath(input.path);
        const dir = dirname(full);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        const prefix = existsSync(full) ? '\n' : '';
        appendFileSync(full, prefix + input.content + '\n', 'utf-8');
        const sync = gitCommitPush(`esmeralda: append ${input.path}`);
        return { ok: true, path: input.path, sync };
      } catch (err) {
        return { error: err.message };
      }
    }
    case 'remove_inbox_line': {
      try {
        const full = safePath(input.path);
        if (!full.includes('/Inbox/')) return { error: 'so pode remover de Inbox/' };
        const content = readFileSync(full, 'utf-8');
        const target = input.line.trim();
        const lines = content.split('\n').filter(l => {
          const stripped = l.replace(/^\s*[-*]\s*\[.\]\s*/, '').replace(/^\s*[-*]\s*/, '').trim();
          return stripped !== target;
        });
        writeFileSync(full, lines.join('\n'), 'utf-8');
        const sync = gitCommitPush(`esmeralda: remove line from ${input.path}`);
        return { ok: true, removed: target, sync };
      } catch (err) {
        return { error: err.message };
      }
    }
    case 'write_journal': {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const path = `Diario/${today}.md`;
        const full = safePath(path);
        const dir = dirname(full);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        const header = `# ${today}\n\n`;
        writeFileSync(full, header + input.summary + '\n', 'utf-8');
        const sync = gitCommitPush(`esmeralda: diario ${today}`);
        return { ok: true, path, sync };
      } catch (err) {
        return { error: err.message };
      }
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
