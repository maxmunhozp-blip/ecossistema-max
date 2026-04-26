// ===== Config =====
const IS_LOCAL = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:';
const API_URL = IS_LOCAL ? 'http://localhost:4100/api' : 'https://terminal.tracktor.com.br/esmeralda-api/api';
const AUTH_TOKEN = 'esmeralda-max-2026';

const headers = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json'
};

// ===== State =====
let dashboardData = null;
let allTasks = [];
let inboxFilter = 'all';

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  setGreeting();
  loadDashboard();
  loadAllTasks();
  setupChat();
  setupSidebar();
  setupModal();
  setupInbox();
  setupInboxFilters();
});

// ===== Greeting =====
function setGreeting() {
  const hour = new Date().getHours();
  let greeting = 'Boa noite, Max';
  if (hour < 12) greeting = 'Bom dia, Max';
  else if (hour < 18) greeting = 'Boa tarde, Max';
  document.getElementById('greeting').textContent = greeting;
}

// ===== Sidebar / Views =====
function setupSidebar() {
  document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById(`view-${view}`).classList.add('active');

      // Refresh data when switching views
      if (view === 'agencia') renderAgenciaView();
      if (view === 'foguetes') renderFoguetesView();
      if (view === 'inbox') { loadAllTasks(); }
      if (view === 'config') renderConfigView();
    });
  });
}

// ===== Dashboard =====
async function loadDashboard() {
  try {
    const res = await fetch(`${API_URL}/dashboard`, { headers });
    if (!res.ok) throw new Error('API error');
    dashboardData = await res.json();
    renderPainel();
  } catch (err) {
    console.error('Erro ao carregar dashboard:', err);
  }
}

function renderPainel() {
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
    list.innerHTML = '<li class="task-item" style="color:var(--text-muted);font-size:13px;">Nenhuma urgencia</li>';
    return;
  }
  list.innerHTML = tasks.map(t => `
    <li class="task-item task-item-urgente">
      <span class="task-dot"></span>
      <div class="task-content">
        <div class="task-title">${esc(t.title)}</div>
        ${t.subtitle ? `<div class="task-subtitle">${esc(t.subtitle)}</div>` : ''}
      </div>
      <button class="btn-icon danger" onclick="deleteTask(${t.id})" title="Remover"><i data-lucide="x" class="icon-sm"></i></button>
    </li>
  `).join('');
}

// ===== Hoje =====
function renderHoje(tasks) {
  const list = document.getElementById('list-hoje');
  const active = tasks.filter(t => !t.done);
  document.getElementById('hoje-count').textContent = `${active.length}/3`;
  list.innerHTML = tasks.map(t => `
    <li class="task-item">
      <input type="checkbox" class="task-check" data-id="${t.id}" ${t.done ? 'checked' : ''}>
      <div class="task-content">
        <div class="task-title ${t.done ? 'done' : ''}">${esc(t.title)}</div>
        ${t.category ? `<span class="task-tag">${esc(t.category)}</span>` : ''}
      </div>
      <button class="btn-icon danger" onclick="deleteTask(${t.id})" title="Remover"><i data-lucide="x" class="icon-sm"></i></button>
    </li>
  `).join('');

  list.querySelectorAll('.task-check').forEach(cb => {
    cb.addEventListener('change', () => toggleTask(cb.dataset.id, cb.checked));
  });
}

// ===== Clients (painel card) =====
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

  let phase = 'Fase 1 — Construindo';
  if (current >= 3000) phase = 'Fase 2 — Respirando';
  if (current >= 8340) phase = 'Fase 3 — Livre';
  document.getElementById('phase-badge').textContent = phase;

  const list = document.getElementById('list-milestones');
  list.innerHTML = milestones.map(m => `
    <li class="milestone-item">
      <span class="milestone-dot ${m.done ? 'done' : ''}" data-id="${m.id}"></span>
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

// ===== VIEW: Agencia =====
async function renderAgenciaView() {
  if (!dashboardData) return;
  const clients = dashboardData.clients;
  const total = clients.reduce((sum, c) => sum + c.revenue, 0);

  // Summary bar
  document.getElementById('agencia-summary').innerHTML = `
    <div class="summary-item"><span class="summary-value">${clients.length}</span>clientes</div>
    <div class="summary-item"><span class="summary-value">R$${formatNum(total)}</span>/mes</div>
  `;

  // Fetch tasks for all clients
  const container = document.getElementById('agencia-clients');
  container.innerHTML = '';

  for (const c of clients) {
    const tasksRes = await fetch(`${API_URL}/clients/${c.id}/tasks`, { headers });
    const tasks = tasksRes.ok ? await tasksRes.json() : [];
    const pendingCount = tasks.filter(t => !t.done).length;

    const div = document.createElement('div');
    div.className = 'client-accordion';
    div.innerHTML = `
      <div class="client-acc-header" onclick="toggleAccordion(this)">
        <i data-lucide="chevron-right" class="client-acc-chevron"></i>
        <span class="client-acc-name">${esc(c.name)}</span>
        ${c.alert ? `<span class="client-acc-alert">${esc(c.alert)}</span>` : ''}
        ${pendingCount > 0 ? `<span class="client-acc-task-count">${pendingCount} pendente${pendingCount > 1 ? 's' : ''}</span>` : ''}
        <span class="client-acc-revenue">R$${formatNum(c.revenue)}</span>
      </div>
      <div class="client-acc-body">
        <ul class="task-list" id="client-tasks-${c.id}">
          ${tasks.length === 0 ? '<li class="task-item" style="color:var(--text-muted);font-size:13px;">Nenhuma tarefa</li>' :
            tasks.map(t => `
              <li class="task-item">
                <input type="checkbox" class="task-check" data-id="${t.id}" ${t.done ? 'checked' : ''}>
                <div class="task-content">
                  <div class="task-title ${t.done ? 'done' : ''}">${esc(t.title)}</div>
                  ${t.subtitle ? `<div class="task-subtitle">${esc(t.subtitle)}</div>` : ''}
                </div>
                <button class="btn-icon danger" onclick="deleteTask(${t.id})" title="Remover"><i data-lucide="x" class="icon-sm"></i></button>
              </li>
            `).join('')}
        </ul>
        <form class="client-add-task" onsubmit="addClientTask(event, ${c.id})">
          <input type="text" placeholder="Nova tarefa pra ${esc(c.name)}..." autocomplete="off">
          <button type="submit">Adicionar</button>
        </form>
        <div class="client-info-row">
          <button onclick="editClient(${c.id})">Editar receita/alerta</button>
        </div>
      </div>
    `;
    container.appendChild(div);
  }

  // Bind checkbox events
  container.querySelectorAll('.task-check').forEach(cb => {
    cb.addEventListener('change', async () => {
      await toggleTask(cb.dataset.id, cb.checked);
      renderAgenciaView();
    });
  });

  lucide.createIcons();
}

function toggleAccordion(header) {
  const accordion = header.parentElement;
  accordion.classList.toggle('open');
}

async function addClientTask(e, clientId) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const title = input.value.trim();
  if (!title) return;

  const res = await fetch(`${API_URL}/clients/${clientId}/tasks`, {
    method: 'POST', headers,
    body: JSON.stringify({ title })
  });

  if (res.ok) {
    input.value = '';
    await loadDashboard();
    renderAgenciaView();
  }
}

async function editClient(id) {
  const client = dashboardData.clients.find(c => c.id === id);
  if (!client) return;

  const newRevenue = prompt(`Receita de ${client.name} (atual: R$${formatNum(client.revenue)}):`, client.revenue);
  if (newRevenue === null) return;

  const newAlert = prompt(`Alerta (vazio pra remover):`, client.alert || '');

  await fetch(`${API_URL}/clients/${id}`, {
    method: 'PATCH', headers,
    body: JSON.stringify({
      revenue: parseInt(newRevenue) || client.revenue,
      alert: newAlert || null
    })
  });
  await loadDashboard();
  renderAgenciaView();
}

// ===== VIEW: Foguetes =====
async function renderFoguetesView() {
  if (!dashboardData) return;
  const container = document.getElementById('foguetes-list');
  container.innerHTML = '';

  for (const p of dashboardData.projects) {
    const tasksRes = await fetch(`${API_URL}/projects/${p.id}/tasks`, { headers });
    const tasks = tasksRes.ok ? await tasksRes.json() : [];
    const pending = tasks.filter(t => !t.done);
    const done = tasks.filter(t => t.done);
    const nextStep = pending[0];

    const mrrBruto = p.clients_count * p.price;
    const mrrLiquido = mrrBruto * (1 - (p.partner_split || 0) / 100);
    const statusClass = p.status === 'active' ? 'active' : 'development';

    const div = document.createElement('div');
    div.className = 'project-block';
    div.innerHTML = `
      <div class="project-block-header">
        <span class="project-block-name">${esc(p.name)}</span>
        <span class="status-badge ${statusClass}">${p.status === 'active' ? 'Ativo' : 'Em dev'}</span>
      </div>
      <div class="project-meta">
        <span class="project-meta-item">Parceiro: <span class="project-meta-value">${esc(p.partner_name || '—')} (${p.partner_split}/${100 - p.partner_split})</span></span>
        <span class="project-meta-item">Clientes: <span class="project-meta-value">${p.clients_count}/${p.clients_goal}</span></span>
        <span class="project-meta-item">MRR: <span class="project-meta-value">R$${formatNum(mrrLiquido)} limpo</span></span>
      </div>
      <div class="project-block-body">
        ${nextStep ? `
          <div class="project-next-step">
            <div class="project-next-label">Proximo passo</div>
            <div class="project-next-title">${esc(nextStep.title)}</div>
            ${nextStep.subtitle ? `<div class="task-subtitle">${esc(nextStep.subtitle)}</div>` : ''}
          </div>
        ` : `
          <div class="project-next-step" style="border-color:var(--border);background:var(--bg);">
            <div class="project-next-label" style="color:var(--text-muted);">Sem proximo passo</div>
            <div class="project-next-title" style="color:var(--text-muted);">Adicione uma tarefa abaixo</div>
          </div>
        `}
        <div class="project-tasks-header">
          <span>Tarefas (${pending.length} pendente${pending.length !== 1 ? 's' : ''}${done.length > 0 ? `, ${done.length} feita${done.length !== 1 ? 's' : ''}` : ''})</span>
        </div>
        <ul class="task-list">
          ${pending.map(t => `
            <li class="task-item">
              <input type="checkbox" class="task-check" data-id="${t.id}" ${t.done ? 'checked' : ''}>
              <div class="task-content">
                <div class="task-title">${esc(t.title)}</div>
                ${t.subtitle ? `<div class="task-subtitle">${esc(t.subtitle)}</div>` : ''}
              </div>
              <button class="btn-icon danger" onclick="deleteTask(${t.id})" title="Remover"><i data-lucide="x" class="icon-sm"></i></button>
            </li>
          `).join('')}
          ${done.map(t => `
            <li class="task-item">
              <input type="checkbox" class="task-check" data-id="${t.id}" checked>
              <div class="task-content">
                <div class="task-title done">${esc(t.title)}</div>
              </div>
            </li>
          `).join('')}
        </ul>
        <form class="project-add-task" onsubmit="addProjectTask(event, ${p.id})">
          <input type="text" placeholder="Proximo passo pro ${esc(p.name)}..." autocomplete="off">
          <button type="submit">Adicionar</button>
        </form>
      </div>
    `;
    container.appendChild(div);
  }

  // Bind checkboxes
  container.querySelectorAll('.task-check').forEach(cb => {
    cb.addEventListener('change', async () => {
      await toggleTask(cb.dataset.id, cb.checked);
      renderFoguetesView();
    });
  });

  lucide.createIcons();
}

async function addProjectTask(e, projectId) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const title = input.value.trim();
  if (!title) return;

  const res = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
    method: 'POST', headers,
    body: JSON.stringify({ title })
  });

  if (res.ok) {
    input.value = '';
    renderFoguetesView();
  }
}

// ===== VIEW: Inbox =====
async function loadAllTasks() {
  try {
    const res = await fetch(`${API_URL}/tasks`, { headers });
    if (!res.ok) return;
    allTasks = await res.json();
    renderInboxTasks();
  } catch (err) {
    console.error('Erro ao carregar tarefas:', err);
  }
}

function setupInbox() {
  const form = document.getElementById('inbox-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('inbox-input');
    const title = input.value.trim();
    if (!title) return;

    const type = document.getElementById('inbox-type').value;
    const category = document.getElementById('inbox-category').value;

    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST', headers,
      body: JSON.stringify({ title, type, category })
    });

    if (res.ok) {
      input.value = '';
      await loadAllTasks();
      await loadDashboard();
    } else {
      const err = await res.json();
      alert(err.error || 'Erro ao criar tarefa');
    }
  });
}

function setupInboxFilters() {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      inboxFilter = tab.dataset.filter;
      renderInboxTasks();
    });
  });
}

function renderInboxTasks() {
  const list = document.getElementById('list-all-tasks');
  let filtered = allTasks;

  if (inboxFilter === 'hoje') filtered = allTasks.filter(t => t.type === 'hoje' && !t.done);
  else if (inboxFilter === 'urgente') filtered = allTasks.filter(t => t.type === 'urgente' && !t.done);
  else if (inboxFilter === 'done') filtered = allTasks.filter(t => t.done);
  else filtered = allTasks.filter(t => !t.done);

  if (filtered.length === 0) {
    list.innerHTML = '<li class="task-item" style="color:var(--text-muted);font-size:13px;">Nenhuma tarefa</li>';
    return;
  }

  list.innerHTML = filtered.map(t => `
    <li class="task-item">
      <input type="checkbox" class="task-check" data-id="${t.id}" ${t.done ? 'checked' : ''}>
      <div class="task-content">
        <div class="task-title ${t.done ? 'done' : ''}">${esc(t.title)}</div>
        ${t.subtitle ? `<div class="task-subtitle">${esc(t.subtitle)}</div>` : ''}
        <span class="task-tag">${esc(t.type)}</span>
        ${t.category ? `<span class="task-tag">${esc(t.category)}</span>` : ''}
      </div>
      <button class="btn-icon danger" onclick="deleteTask(${t.id})" title="Remover"><i data-lucide="x" class="icon-sm"></i></button>
    </li>
  `).join('');

  list.querySelectorAll('.task-check').forEach(cb => {
    cb.addEventListener('change', () => toggleTask(cb.dataset.id, cb.checked));
  });

  lucide.createIcons();
}

// ===== VIEW: Config =====
function renderConfigView() {
  document.getElementById('config-api-url').textContent = API_URL;

  fetch(`${API_URL.replace('/api', '')}/health`, { headers })
    .then(r => r.json())
    .then(() => {
      document.getElementById('config-api-status').textContent = 'Conectado';
      document.getElementById('config-api-status').style.color = '#2d7a2d';
    })
    .catch(() => {
      document.getElementById('config-api-status').textContent = 'Offline';
      document.getElementById('config-api-status').style.color = '#c44';
    });

  if (dashboardData) {
    document.getElementById('config-clients-count').textContent = dashboardData.clients.length;
    const totalTasks = (dashboardData.tasks.urgente?.length || 0) + (dashboardData.tasks.hoje?.length || 0);
    document.getElementById('config-tasks-count').textContent = totalTasks;
    document.getElementById('config-projects-count').textContent = dashboardData.projects.length;
  }
}

// ===== Modal =====
function setupModal() {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  document.getElementById('btn-add-hoje').addEventListener('click', () => openModal('hoje'));
  document.getElementById('btn-add-urgente').addEventListener('click', () => openModal('urgente'));

  document.getElementById('modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('modal-task-title').value.trim();
    if (!title) return;

    const body = {
      title,
      subtitle: document.getElementById('modal-task-subtitle').value.trim() || null,
      type: document.getElementById('modal-task-type').value,
      category: document.getElementById('modal-task-category').value
    };

    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST', headers, body: JSON.stringify(body)
    });

    if (res.ok) {
      closeModal();
      await loadDashboard();
      await loadAllTasks();
    } else {
      const err = await res.json();
      alert(err.error || 'Erro ao criar tarefa');
    }
  });
}

function openModal(type) {
  document.getElementById('modal-task-title').value = '';
  document.getElementById('modal-task-subtitle').value = '';
  document.getElementById('modal-task-type').value = type || 'hoje';
  document.getElementById('modal-task-category').value = 'geral';
  document.getElementById('modal-title').textContent = type === 'urgente' ? 'Nova urgencia' : 'Nova tarefa';
  document.getElementById('modal-overlay').classList.add('active');
  document.getElementById('modal-task-title').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

// ===== API Actions =====
async function toggleTask(id, done) {
  await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH', headers, body: JSON.stringify({ done: done ? 1 : 0 })
  });
  await loadDashboard();
  await loadAllTasks();
}

async function deleteTask(id) {
  await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE', headers });
  await loadDashboard();
  await loadAllTasks();
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

  document.querySelectorAll('.suggestion').forEach(btn => {
    btn.addEventListener('click', () => sendChat(btn.dataset.msg));
  });
}

async function sendChat(message) {
  const container = document.getElementById('chat-messages');
  const suggestions = document.getElementById('chat-suggestions');

  appendBubble('user', message);
  suggestions.style.display = 'none';

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

    let html = esc(data.message);
    if (data.actions && data.actions.length > 0) {
      html += '<div class="actions-list">';
      data.actions.forEach(a => {
        html += `<span class="action-badge">${esc(a.description)}</span>`;
      });
      html += '</div>';
      await loadDashboard();
      await loadAllTasks();
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

// Make functions available globally for onclick handlers
window.deleteTask = deleteTask;
window.editClient = editClient;
window.toggleAccordion = toggleAccordion;
window.addClientTask = addClientTask;
window.addProjectTask = addProjectTask;
