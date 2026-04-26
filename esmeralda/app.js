// ===== Config =====
const IS_LOCAL = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:';
const API_URL = IS_LOCAL ? 'http://localhost:4100/api' : 'https://esmeralda-api.tracktor.com.br/api';
const AUTH_TOKEN = 'esmeralda-max-2026';

const headers = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json'
};

// ===== State =====
let dashboardData = null;

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  setGreeting();
  loadDashboard();
  setupChat();
  setupSidebar();
});

// ===== Greeting =====
function setGreeting() {
  const hour = new Date().getHours();
  let greeting = 'Boa noite, Max';
  if (hour < 12) greeting = 'Bom dia, Max';
  else if (hour < 18) greeting = 'Boa tarde, Max';
  document.getElementById('greeting').textContent = greeting;
}

// ===== Dashboard =====
async function loadDashboard() {
  try {
    const res = await fetch(`${API_URL}/dashboard`, { headers });
    if (!res.ok) throw new Error('API error');
    dashboardData = await res.json();
    renderAll();
  } catch (err) {
    console.error('Erro ao carregar dashboard:', err);
  }
}

function renderAll() {
  if (!dashboardData) return;
  renderUrgencias(dashboardData.tasks.urgente);
  renderHoje(dashboardData.tasks.hoje);
  renderClients(dashboardData.clients);
  renderMapa(dashboardData.milestones, dashboardData.summary);
  renderPendencias(dashboardData.pendencias);
  lucide.createIcons();
}

// ===== Urgencias =====
function renderUrgencias(tasks) {
  const list = document.getElementById('list-urgente');
  if (tasks.length === 0) {
    list.innerHTML = '<li class="task-item" style="color:var(--text-muted);font-size:13px;">Nenhuma urgencia no momento</li>';
    return;
  }
  list.innerHTML = tasks.map(t => `
    <li class="task-item task-item-urgente">
      <span class="task-dot"></span>
      <div class="task-content">
        <div class="task-title">${esc(t.title)}</div>
        ${t.subtitle ? `<div class="task-subtitle">${esc(t.subtitle)}</div>` : ''}
      </div>
    </li>
  `).join('');
}

// ===== Hoje =====
function renderHoje(tasks) {
  const list = document.getElementById('list-hoje');
  document.getElementById('hoje-count').textContent = `${tasks.filter(t => !t.done).length}/3`;
  list.innerHTML = tasks.map(t => `
    <li class="task-item">
      <input type="checkbox" class="task-check" data-id="${t.id}" data-type="task" ${t.done ? 'checked' : ''}>
      <div class="task-content">
        <div class="task-title ${t.done ? 'done' : ''}">${esc(t.title)}</div>
        ${t.category ? `<span class="task-tag">${esc(t.category)}</span>` : ''}
      </div>
    </li>
  `).join('');

  list.querySelectorAll('.task-check').forEach(cb => {
    cb.addEventListener('change', () => toggleTask(cb.dataset.id, cb.checked));
  });
}

// ===== Clients =====
function renderClients(clients) {
  const list = document.getElementById('list-clients');
  const maxRevenue = Math.max(...clients.map(c => c.revenue));
  const total = clients.reduce((sum, c) => sum + c.revenue, 0);

  list.innerHTML = clients.map(c => `
    <li class="client-item">
      <span class="client-name">${esc(c.name)}${c.alert ? `<span class="client-alert" title="${esc(c.alert)}"> !</span>` : ''}</span>
      <div class="client-bar-container">
        <div class="client-bar" style="width:${(c.revenue / maxRevenue * 100).toFixed(0)}%"></div>
      </div>
      <span class="client-revenue">R$${formatNum(c.revenue)}</span>
    </li>
  `).join('');

  document.getElementById('total-revenue').textContent = `Total: R$${formatNum(total)}/mes`;
}

// ===== Mapa da Liberdade =====
function renderMapa(milestones, summary) {
  const goal = 8340;
  const current = summary.saasRevenue;
  const pct = Math.min((current / goal) * 100, 100);

  document.getElementById('saas-progress').style.width = `${pct}%`;
  document.getElementById('saas-label').textContent = `R$${formatNum(current)} / R$${formatNum(goal)} meta`;

  // Determine phase
  let phase = 'Fase 1 — Construindo';
  if (current >= 3000) phase = 'Fase 2 — Respirando';
  if (current >= 8340) phase = 'Fase 3 — Livre';
  document.getElementById('phase-badge').textContent = phase;

  const list = document.getElementById('list-milestones');
  list.innerHTML = milestones.map(m => `
    <li class="milestone-item">
      <span class="milestone-dot ${m.done ? 'done' : ''}" data-id="${m.id}" data-type="milestone"></span>
      <span class="milestone-title ${m.done ? 'done' : ''}">${esc(m.title)}</span>
      ${m.value ? `<span class="milestone-value">${esc(m.value)}</span>` : ''}
    </li>
  `).join('');

  list.querySelectorAll('.milestone-dot').forEach(dot => {
    dot.addEventListener('click', () => toggleMilestone(dot.dataset.id, !dot.classList.contains('done')));
  });
}

// ===== Pendencias =====
function renderPendencias(pendencias) {
  const container = document.getElementById('list-pendencias');
  container.innerHTML = pendencias.map(p => `
    <div class="pendencia-item">
      <input type="checkbox" class="pendencia-check" data-id="${p.id}" ${p.done ? 'checked' : ''}>
      <span class="pendencia-title ${p.done ? 'done' : ''}">${esc(p.title)}</span>
    </div>
  `).join('');

  container.querySelectorAll('.pendencia-check').forEach(cb => {
    cb.addEventListener('change', () => togglePendencia(cb.dataset.id, cb.checked));
  });
}

// ===== API Actions =====
async function toggleTask(id, done) {
  await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH', headers, body: JSON.stringify({ done: done ? 1 : 0 })
  });
  loadDashboard();
}

async function toggleMilestone(id, done) {
  await fetch(`${API_URL}/milestones/${id}`, {
    method: 'PATCH', headers, body: JSON.stringify({ done: done ? 1 : 0 })
  });
  loadDashboard();
}

async function togglePendencia(id, done) {
  await fetch(`${API_URL}/pendencias/${id}`, {
    method: 'PATCH', headers, body: JSON.stringify({ done: done ? 1 : 0 })
  });
  loadDashboard();
}

// ===== Chat =====
function setupChat() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-text');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    sendChat(msg);
  });

  // Suggestions
  document.querySelectorAll('.suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      sendChat(btn.dataset.msg);
    });
  });
}

async function sendChat(message) {
  const container = document.getElementById('chat-messages');
  const suggestions = document.getElementById('chat-suggestions');

  // Add user bubble
  appendBubble('user', message);
  suggestions.style.display = 'none';

  // Show typing
  const typing = document.createElement('div');
  typing.className = 'chat-typing';
  typing.textContent = 'Pensando...';
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;

  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST', headers, body: JSON.stringify({ message })
    });
    const data = await res.json();
    typing.remove();

    if (data.error) {
      appendBubble('assistant', 'Erro: ' + data.error);
      return;
    }

    // Build response with actions
    let html = esc(data.message);
    if (data.actions && data.actions.length > 0) {
      html += '<div class="actions-list">';
      data.actions.forEach(a => {
        html += `<span class="action-badge">${esc(a.description)}</span>`;
      });
      html += '</div>';
      // Reload dashboard since data changed
      loadDashboard();
    }

    appendBubbleHTML('assistant', html);
  } catch (err) {
    typing.remove();
    appendBubble('assistant', 'Erro ao conectar com o servidor.');
  }
}

function appendBubble(role, text) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `chat-bubble ${role}`;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function appendBubbleHTML(role, html) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `chat-bubble ${role}`;
  div.innerHTML = html;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

// ===== Sidebar =====
function setupSidebar() {
  document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Future: switch views
    });
  });
}

// ===== Helpers =====
function esc(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatNum(n) {
  return new Intl.NumberFormat('pt-BR').format(n);
}
