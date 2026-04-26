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
let focusTasks = [];
let focusIndex = 0;

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  loadDashboard().then(() => {
    setupFocus();
    greetUser();
  });
  setupChat();
  setupSidebar();
  setupModal();
});

// ===== Sidebar / Views =====
function setupSidebar() {
  document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById(`view-${view}`).classList.add('active');

      if (view === 'agencia') renderAgenciaView();
      if (view === 'foguetes') renderFoguetesView();
      if (view === 'pendencias') renderPendenciasView();
    });
  });
}

function goHome() {
  document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-view="home"]').classList.add('active');
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-home').classList.add('active');
}
window.goHome = goHome;

// ===== Dashboard Data =====
async function loadDashboard() {
  try {
    const res = await fetch(`${API_URL}/dashboard`, { headers });
    if (!res.ok) throw new Error('API error');
    dashboardData = await res.json();
  } catch (err) {
    console.error('Erro ao carregar dashboard:', err);
  }
}

// ===== Focus Mode =====
let focusDoneCount = 0;
let focusTotal = 0;

function setupFocus() {
  // Always bind buttons first
  document.getElementById('btn-done').addEventListener('click', handleFocusDone);
  document.getElementById('btn-skip').addEventListener('click', handleFocusSkip);

  loadFocusTasks();
}

function loadFocusTasks() {
  if (!dashboardData) {
    document.getElementById('focus-bar').classList.add('empty');
    return;
  }

  const urgente = (dashboardData.tasks.urgente || []).filter(t => !t.done);
  const hoje = (dashboardData.tasks.hoje || []).filter(t => !t.done);
  focusTasks = [...urgente, ...hoje];
  focusIndex = 0;

  if (focusTasks.length === 0) {
    document.getElementById('focus-bar').classList.add('empty');
    return;
  }

  focusTotal = focusTasks.length;
  focusDoneCount = 0;
  renderFocusTask();
}

async function handleFocusDone() {
  const task = focusTasks[focusIndex];
  if (!task) return;

  // Disable buttons during request
  document.getElementById('btn-done').disabled = true;

  await fetch(`${API_URL}/tasks/${task.id}`, {
    method: 'PATCH', headers, body: JSON.stringify({ done: 1 })
  });

  focusDoneCount++;
  focusTasks.splice(focusIndex, 1);

  if (focusTasks.length === 0) {
    document.getElementById('focus-bar').classList.add('empty');
    appendBubble('assistant', 'Todas as tarefas de hoje feitas. Descansa ou me conta o que mais ta na sua cabeca.');
  } else {
    if (focusIndex >= focusTasks.length) focusIndex = 0;
    renderFocusTask();
  }

  document.getElementById('btn-done').disabled = false;
  await loadDashboard();
}

function handleFocusSkip() {
  if (focusTasks.length <= 1) {
    // Only 1 task — show inline feedback
    const taskEl = document.getElementById('focus-task');
    const original = taskEl.textContent;
    taskEl.textContent = 'So tem essa por enquanto';
    taskEl.style.color = 'var(--text-muted)';
    setTimeout(() => {
      taskEl.textContent = original;
      taskEl.style.color = '';
    }, 1500);
    return;
  }
  focusIndex = (focusIndex + 1) % focusTasks.length;
  renderFocusTask();
}

function renderFocusTask() {
  const task = focusTasks[focusIndex];
  if (!task) return;

  document.getElementById('focus-task').textContent = task.title;
  document.getElementById('focus-bar').classList.remove('empty');

  const pct = focusTotal > 0 ? ((focusDoneCount / focusTotal) * 100) : 0;
  document.getElementById('focus-progress').style.width = `${pct}%`;

  lucide.createIcons();
}

// ===== Greeting =====
function greetUser() {
  const hour = new Date().getHours();
  let greeting = 'Boa noite';
  if (hour < 12) greeting = 'Bom dia';
  else if (hour < 18) greeting = 'Boa tarde';

  let msg = `${greeting}, Max.`;

  if (focusTasks.length > 0) {
    msg += ` Voce tem ${focusTasks.length} coisa${focusTasks.length > 1 ? 's' : ''} pra hoje.`;
    msg += ` A primeira: "${focusTasks[0].title}".`;
    msg += `\n\nFala comigo se precisar de ajuda ou se quiser despejar o que ta na cabeca.`;
  } else {
    msg += ` Nenhuma tarefa pra hoje ainda.`;
    msg += `\n\nMe conta o que ta rolando — eu organizo pra voce.`;
  }

  appendBubble('assistant', msg);
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
    btn.addEventListener('click', () => {
      sendChat(btn.dataset.msg);
      document.getElementById('chat-suggestions').style.display = 'none';
    });
  });
}

async function sendChat(message) {
  const container = document.getElementById('chat-messages');
  const suggestions = document.getElementById('chat-suggestions');

  appendBubble('user', message);
  suggestions.style.display = 'none';

  const typing = document.createElement('div');
  typing.className = 'chat-typing';
  typing.textContent = 'Pensando';
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

    let html = formatMd(data.message);
    if (data.actions && data.actions.length > 0) {
      html += '<div class="actions-list">';
      data.actions.forEach(a => {
        html += `<span class="action-badge">${esc(a.description)}</span>`;
      });
      html += '</div>';
      // Refresh data after AI actions
      await loadDashboard();
      refreshFocus();
    }

    appendBubbleHTML('assistant', html);
  } catch (err) {
    typing.remove();
    appendBubble('assistant', 'Erro ao conectar com o servidor.');
  }
}

function refreshFocus() {
  loadFocusTasks();
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

// ===== VIEW: Agencia =====
async function renderAgenciaView() {
  if (!dashboardData) await loadDashboard();
  if (!dashboardData) return;

  const clients = dashboardData.clients;
  const total = clients.reduce((sum, c) => sum + c.revenue, 0);

  document.getElementById('agencia-summary').innerHTML = `
    <div class="summary-item"><span class="summary-value">${clients.length}</span>clientes</div>
    <div class="summary-item"><span class="summary-value">R$${formatNum(total)}</span>/mes</div>
  `;

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

  container.querySelectorAll('.task-check').forEach(cb => {
    cb.addEventListener('change', async () => {
      await toggleTask(cb.dataset.id, cb.checked);
      renderAgenciaView();
    });
  });

  lucide.createIcons();
}

function toggleAccordion(header) {
  header.parentElement.classList.toggle('open');
}
window.toggleAccordion = toggleAccordion;

async function addClientTask(e, clientId) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const title = input.value.trim();
  if (!title) return;

  const res = await fetch(`${API_URL}/clients/${clientId}/tasks`, {
    method: 'POST', headers, body: JSON.stringify({ title })
  });

  if (res.ok) {
    input.value = '';
    await loadDashboard();
    renderAgenciaView();
  }
}
window.addClientTask = addClientTask;

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
window.editClient = editClient;

// ===== VIEW: Foguetes =====
async function renderFoguetesView() {
  if (!dashboardData) await loadDashboard();
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
              <input type="checkbox" class="task-check" data-id="${t.id}">
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
    method: 'POST', headers, body: JSON.stringify({ title })
  });

  if (res.ok) {
    input.value = '';
    renderFoguetesView();
  }
}
window.addProjectTask = addProjectTask;

// ===== VIEW: Pendencias =====
async function renderPendenciasView() {
  if (!dashboardData) await loadDashboard();
  if (!dashboardData) return;

  const container = document.getElementById('list-pendencias');
  const pendencias = dashboardData.pendencias || [];

  container.innerHTML = pendencias.map(p => `
    <div class="pendencia-item">
      <input type="checkbox" class="pendencia-check" data-id="${p.id}" ${p.done ? 'checked' : ''}>
      <span class="pendencia-title ${p.done ? 'done' : ''}">${esc(p.title)}</span>
    </div>
  `).join('');

  container.querySelectorAll('.pendencia-check').forEach(cb => {
    cb.addEventListener('change', async () => {
      await togglePendencia(cb.dataset.id, cb.checked);
      renderPendenciasView();
    });
  });
}

// ===== Modal =====
function setupModal() {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

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
      refreshFocus();
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
}

async function deleteTask(id) {
  await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE', headers });
  await loadDashboard();
  refreshFocus();
}
window.deleteTask = deleteTask;

async function toggleMilestone(id, done) {
  await fetch(`${API_URL}/milestones/${id}`, {
    method: 'PATCH', headers, body: JSON.stringify({ done: done ? 1 : 0 })
  });
  await loadDashboard();
}

async function togglePendencia(id, done) {
  await fetch(`${API_URL}/pendencias/${id}`, {
    method: 'PATCH', headers, body: JSON.stringify({ done: done ? 1 : 0 })
  });
  await loadDashboard();
}

// ===== Helpers =====
function esc(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatMd(str) {
  if (!str) return '';
  let html = esc(str);
  // **bold**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // *italic*
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Lines starting with - as list items
  html = html.replace(/^- (.+)$/gm, '<span style="display:block;padding-left:12px;">&#8226; $1</span>');
  return html;
}

function formatNum(n) {
  return new Intl.NumberFormat('pt-BR').format(n);
}
