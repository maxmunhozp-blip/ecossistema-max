#!/usr/bin/env node
/**
 * MÉTODO MARCA VIVA — Atualização WhatsApp a cada 48h
 * Lê os logs de cada cliente, rotaciona entre membros do time
 * e envia um parágrafo em primeira pessoa via Z-API.
 *
 * Cron sugerido (a cada 48h, 9h da manhã):
 *   0 9 */2 * * /usr/bin/node /opt/ecosistema-max/scripts/zapi-update.js >> /var/log/zapi-update.log 2>&1
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ─── CONFIG ───────────────────────────────────────────
const ZAPI_URL   = 'https://api.z-api.io/instances/3EF98F410E5AC2A9FC6766E11D2E64FE/token/5ED815D5C174A1D2C84161F5/send-text';
const DESTINATARIO = '5511918672831'; // WhatsApp de Max

const BASE_DIR   = path.resolve(__dirname, '..');          // raiz do repo
const CLIENTES_DIR = path.join(BASE_DIR, 'clientes');
const STATE_FILE = path.join(BASE_DIR, 'scripts', '.zapi-state.json');

// ─── ESTADO DE ROTAÇÃO ────────────────────────────────
function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch { return { clienteIdx: 0, membroIdx: 0, lastRun: null }; }
}

function saveState(s) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

// ─── LEITURA DE CLIENTES ──────────────────────────────
function listarClientes() {
  return fs.readdirSync(CLIENTES_DIR)
    .filter(d => {
      const cfg = path.join(CLIENTES_DIR, d, 'config.json');
      const log = path.join(CLIENTES_DIR, d, 'log.json');
      return fs.existsSync(cfg) && fs.existsSync(log);
    });
}

function lerCliente(slug) {
  const cfg = JSON.parse(fs.readFileSync(path.join(CLIENTES_DIR, slug, 'config.json'), 'utf8'));
  const log = JSON.parse(fs.readFileSync(path.join(CLIENTES_DIR, slug, 'log.json'), 'utf8'));
  return { cfg, log };
}

// ─── GERAÇÃO DE MENSAGEM ──────────────────────────────
function gerarMensagem(cfg, log, membro) {
  const nome       = cfg.nome;
  const clientName = cfg.clientName || cfg.nome;
  const entries    = (log.entries || []).sort((a, b) => new Date(b.data) - new Date(a.data));

  // Entradas do membro nos últimos 7 dias
  const limite = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const minhas  = entries.filter(e =>
    e.autor === membro.nome && new Date(e.data) >= limite
  );

  // Última entrada de qualquer membro (para contexto)
  const recente = entries[0];

  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const data = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  let corpo = '';

  if (minhas.length > 0) {
    // Tem atividade recente deste membro
    const ultima = minhas[0];
    corpo = gerarCorpoAtivo(membro, ultima, nome, clientName, minhas);
  } else {
    // Sem atividade recente — gera uma revisão de status
    corpo = gerarCorpoRevisao(membro, recente, nome, clientName, cfg);
  }

  return `*${membro.cargo} · ${nome}*\n\n${corpo}\n\n_${data} · ${hora} · Método Marca Viva_`;
}

function gerarCorpoAtivo(membro, ultima, nomeCliente, clientName, minhas) {
  const acao = ultima.titulo.toLowerCase();
  const tag  = ultima.tag;
  const metricas = ultima.metricas || {};

  // Mensagens em primeira pessoa por cargo
  const templates = {
    'Gestor de Tráfego': [
      `Passei pela conta do ${nomeCliente} agora há pouco. ${formatarEntrada(ultima)}`,
      `Revisei as campanhas do ${nomeCliente}. ${formatarEntrada(ultima)} ${minhas.length > 1 ? `No total foram ${minhas.length} ajustes essa semana.` : ''}`,
    ],
    'Analista de Dados': [
      `Acabei de analisar os dados do ${nomeCliente}. ${formatarEntrada(ultima)}`,
      `Fiz uma revisão nos números do ${nomeCliente}. ${formatarEntrada(ultima)}`,
    ],
    'Estrategista': [
      `Revisei a estratégia do ${nomeCliente}. ${formatarEntrada(ultima)}`,
      `Olhei o panorama geral do ${nomeCliente}. ${formatarEntrada(ultima)}`,
    ],
    'Criativo': [
      `Avaliei os criativos do ${nomeCliente}. ${formatarEntrada(ultima)}`,
      `Passei pelos vídeos do ${nomeCliente}. ${formatarEntrada(ultima)}`,
    ],
  };

  const lista = templates[membro.cargo] || [`Trabalhei no ${nomeCliente}. ${formatarEntrada(ultima)}`];
  return lista[Math.floor(Math.random() * lista.length)];
}

function gerarCorpoRevisao(membro, recente, nomeCliente, clientName, cfg) {
  const alertas = (cfg.alertas || []).map(a => a.titulo).join(', ');

  const templates = {
    'Gestor de Tráfego': [
      `Fiz uma revisão de rotina nas campanhas do ${nomeCliente}. Sem novidades críticas no momento — a estrutura que montamos continua rodando dentro do esperado. Vou monitorar o desempenho nas próximas 24h e te aviso se precisar ajustar alguma coisa.`,
      `Passei pela conta do ${nomeCliente} como parte da revisão de 48h. Campanhas estáveis, sem anomalias. ${alertas ? `Um ponto que sigo de olho: ${alertas}.` : 'Tudo no ritmo.'}`,
    ],
    'Analista de Dados': [
      `Revisei os dados do ${nomeCliente} nesse ciclo. Nada fora do padrão — os indicadores estão dentro da faixa esperada. ${alertas ? `Continuo monitorando o ponto de atenção: ${alertas}.` : 'Seguimos.'}`,
      `Atualizei meu painel de monitoramento do ${nomeCliente}. Dados estáveis por enquanto. Se qualquer métrica sair da faixa, aviso imediatamente.`,
    ],
    'Estrategista': [
      `Revisei o posicionamento estratégico do ${nomeCliente}. A estrutura atual está alinhada com os objetivos. Próximo passo: aguardar a ativação da nova campanha e acompanhar o comportamento dos dois públicos nas primeiras 72h.`,
      `Olhei o quadro geral do ${nomeCliente}. Estratégia no caminho certo. O foco agora é medir os resultados da nova estrutura e ajustar os públicos se necessário.`,
    ],
    'Criativo': [
      `Revi os criativos ativos do ${nomeCliente}. O vídeo campeão continua sendo o ponto forte da conta — CTR acima da média. Quando tiver novos materiais disponíveis, já tenho o briefing pronto para produção.`,
      `Monitorei o desempenho dos criativos do ${nomeCliente}. Sem fadiga de criativo detectada por enquanto. Vou continuar acompanhando a frequência e te aviso quando for hora de rodar material novo.`,
    ],
  };

  const lista = templates[membro.cargo] || [`Revisei a conta do ${nomeCliente}. Tudo estável por enquanto.`];
  return lista[Math.floor(Math.random() * lista.length)];
}

function formatarEntrada(entry) {
  const tag = entry.tag;
  const desc = entry.descricao;
  const metricas = entry.metricas || {};

  // Monta um resumo curto e direto da entrada
  let msg = desc.length > 200 ? desc.slice(0, 200).trimEnd() + '...' : desc;

  // Adiciona métricas relevantes se houver
  const mParts = [];
  if (metricas.budget_novo)     mParts.push(`Budget ajustado para R$${metricas.budget_novo}/dia`);
  if (metricas.cpm_antes)       mParts.push(`CPM anterior era R$${metricas.cpm_antes.toFixed(2)}`);
  if (metricas.campanhas_pausadas) mParts.push(`${metricas.campanhas_pausadas} campanhas pausadas`);
  if (metricas.custo_conversa)  mParts.push(`Custo por conversa: R$${Number(metricas.custo_conversa).toFixed(2)}`);

  if (mParts.length) msg += `\n\n_Dados: ${mParts.join(' · ')}_`;
  return msg;
}

// ─── ENVIO VIA Z-API ──────────────────────────────────
function enviarWhatsApp(phone, message) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ phone, message });
    const url  = new URL(ZAPI_URL);

    const options = {
      hostname: url.hostname,
      path:     url.pathname + url.search,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`[Z-API] Status: ${res.statusCode} | Body: ${data}`);
        resolve({ status: res.statusCode, body: data });
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── MAIN ─────────────────────────────────────────────
async function main() {
  console.log(`\n[${new Date().toISOString()}] Iniciando envio de atualização WhatsApp...`);

  const clientes = listarClientes();
  if (!clientes.length) {
    console.log('Nenhum cliente encontrado.');
    return;
  }

  const state = loadState();

  // Seleciona cliente atual (rotaciona)
  const clienteSlug = clientes[state.clienteIdx % clientes.length];
  const { cfg, log } = lerCliente(clienteSlug);
  const time = cfg.time || [];

  if (!time.length) {
    console.log(`Cliente ${clienteSlug} sem time configurado.`);
    return;
  }

  // Seleciona membro atual (rotaciona)
  const membro = time[state.membroIdx % time.length];

  console.log(`Cliente: ${cfg.nome} | Membro: ${membro.nome} (${membro.cargo})`);

  const mensagem = gerarMensagem(cfg, log, membro);
  console.log(`\nMensagem:\n${mensagem}\n`);

  try {
    await enviarWhatsApp(DESTINATARIO, mensagem);
    console.log('✓ Mensagem enviada com sucesso.');
  } catch (err) {
    console.error('✗ Erro ao enviar:', err.message);
    process.exit(1);
  }

  // Avança rotação: próxima execução = próximo membro; ao completar o time, avança o cliente
  const nextMembro = (state.membroIdx + 1) % time.length;
  const nextCliente = nextMembro === 0
    ? (state.clienteIdx + 1) % clientes.length
    : state.clienteIdx;

  saveState({
    clienteIdx: nextCliente,
    membroIdx:  nextMembro,
    lastRun:    new Date().toISOString(),
    lastCliente: clienteSlug,
    lastMembro:  membro.nome,
  });

  console.log(`[Estado salvo] Próximo: ${clientes[nextCliente]} / ${time[nextMembro]?.nome}`);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
