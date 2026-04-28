import { Router } from 'express';
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, relative, dirname } from 'path';
import { execSync } from 'child_process';
import db from '../db.js';

const router = Router();
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
    return true;
  } catch {
    return false;
  }
}

// Lista todos os arquivos do Inbox/ com previa do conteudo
router.get('/obsidian/inbox', (req, res) => {
  try {
    const inboxPath = join(VAULT_PATH, 'Inbox');
    if (!existsSync(inboxPath)) return res.json({ files: [] });

    const files = readdirSync(inboxPath)
      .filter(f => f.endsWith('.md'))
      .map(f => {
        const full = join(inboxPath, f);
        const stat = statSync(full);
        const content = readFileSync(full, 'utf-8');
        const items = parseInboxItems(content);
        return {
          name: f.replace('.md', ''),
          path: `Inbox/${f}`,
          mtime: stat.mtime.toISOString(),
          itemCount: items.length,
          items
        };
      })
      .sort((a, b) => b.mtime.localeCompare(a.mtime));

    // Detecta itens novos: comparado ao ultimo "seen"
    const lastSeen = db.prepare("SELECT value FROM kv WHERE key = 'inbox_last_seen'").get()?.value;
    const lastSeenDate = lastSeen ? new Date(lastSeen) : new Date(0);
    let newCount = 0;
    files.forEach(f => {
      if (new Date(f.mtime) > lastSeenDate) newCount += f.itemCount;
    });

    res.json({ files, newCount, lastSeen });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Marca o inbox como visto (zera o contador de "novidades")
router.post('/obsidian/inbox/seen', (req, res) => {
  const now = new Date().toISOString();
  db.prepare("INSERT INTO kv (key, value) VALUES ('inbox_last_seen', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(now);
  res.json({ ok: true, seen_at: now });
});

// Promove um item do inbox pra tarefa, e remove a linha do .md
router.post('/obsidian/inbox/promote', (req, res) => {
  const { path, line, type, category, client_id } = req.body;
  if (!path || !line || !type) return res.status(400).json({ error: 'path, line, type obrigatorios' });

  try {
    // Cria a tarefa
    if (type === 'hoje') {
      const count = db.prepare("SELECT COUNT(*) as n FROM tasks WHERE type = 'hoje' AND done = 0").get().n;
      if (count >= 3) return res.status(400).json({ error: 'Maximo 3 tarefas no Hoje. Tira uma antes.' });
    }
    const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) as m FROM tasks WHERE type = ?').get(type).m;
    const result = db.prepare('INSERT INTO tasks (title, category, type, client_id, position) VALUES (?, ?, ?, ?, ?)').run(
      line, category || 'geral', type, client_id || null, maxPos + 1
    );

    // Remove a linha do .md
    const full = safePath(path);
    const content = readFileSync(full, 'utf-8');
    const target = line.trim();
    const newLines = content.split('\n').filter(l => {
      const stripped = l.replace(/^\s*[-*]\s*\[.\]\s*/, '').replace(/^\s*[-*]\s*/, '').trim();
      return stripped !== target;
    });
    writeFileSync(full, newLines.join('\n'), 'utf-8');
    gitCommitPush(`esmeralda: promote "${target.slice(0, 40)}" -> ${type}`);

    res.json({ ok: true, task: db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove uma linha do inbox (descartar sem virar tarefa)
router.post('/obsidian/inbox/dismiss', (req, res) => {
  const { path, line } = req.body;
  try {
    const full = safePath(path);
    if (!full.includes('/Inbox/')) return res.status(400).json({ error: 'so Inbox/' });
    const content = readFileSync(full, 'utf-8');
    const target = line.trim();
    const newLines = content.split('\n').filter(l => {
      const stripped = l.replace(/^\s*[-*]\s*\[.\]\s*/, '').replace(/^\s*[-*]\s*/, '').trim();
      return stripped !== target;
    });
    writeFileSync(full, newLines.join('\n'), 'utf-8');
    gitCommitPush(`esmeralda: dismiss "${target.slice(0, 40)}"`);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Parser de linhas do markdown — pega bullets como itens
function parseInboxItems(content) {
  const items = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Bullet com checkbox: - [ ] ou - [x]
    const checkbox = trimmed.match(/^[-*]\s*\[(.)\]\s*(.+)$/);
    if (checkbox) {
      items.push({ text: checkbox[2].trim(), done: checkbox[1] !== ' ', type: 'task' });
      continue;
    }
    // Bullet simples: - texto
    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet && !bullet[1].startsWith('[')) {
      items.push({ text: bullet[1].trim(), done: false, type: 'item' });
      continue;
    }
  }
  return items;
}

export default router;
