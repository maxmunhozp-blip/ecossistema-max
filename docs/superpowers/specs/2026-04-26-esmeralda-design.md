# Esmeralda — Painel Pessoal do Max

> Spec aprovada em 2026-04-26

---

## O que é

Dashboard pessoal online para gestão da vida profissional do Max Munhoz. Hospedado em `tracktor.com.br/esmeralda`. Fica aberto o dia todo no navegador. Inclui agente IA (chat) integrado que organiza, prioriza e edita os dados do painel via conversa natural.

## Quem usa

- **Agora:** só Max (admin único)
- **Futuro:** abrir pra clientes da agência verem status dos próprios projetos (multi-tenant)

## Decisões de design aprovadas

| Decisão | Escolha |
|---------|---------|
| Vibe visual | Neutro quente (fundo creme, tons terrosos, estilo Notion/Linear) |
| Layout | Sidebar fina com ícones + grid de cards no centro |
| Chat IA | Painel lateral direito, sempre visível |
| Dados | Banco de dados próprio (não lê Obsidian diretamente) |
| Hosting | Estático no Hostinger via FTP (tracktor.com.br/esmeralda) + API na VPS |

## Princípios UX (TDAH-friendly)

- Máximo 5-6 blocos visíveis por vez
- Hierarquia clara: olho sabe onde ir sem pensar
- Cada bloco leva a ação, não só informação passiva
- Zero indicadores que geram culpa (contadores vermelhos, barras "atrasadas")
- Urgências em tom âmbar suave, nunca vermelho gritante
- Zero emojis, ícones Lucide em tom de marca
- Limite de 3 tarefas no "Hoje"

## Estrutura do painel

### Sidebar (56px, fixa à esquerda)

| Ícone | Destino | Descrição |
|-------|---------|-----------|
| E (logo) | - | Logo Esmeralda |
| Grid | Painel | Dashboard principal (home) |
| Pessoas | Agência | Visão detalhada dos clientes |
| Foguete | Foguetes | AdvocaciaIA + CorretorIA detalhado |
| Inbox | Inbox | Itens não organizados |
| Config | Config | Configurações do sistema |

### Cards do painel principal (grid 2 colunas)

**1. Urgências** (card âmbar)
- Itens que precisam de ação HOJE
- Dot âmbar + texto + subtexto
- Sem limite de itens mas design incentiva poucos

**2. Hoje — máximo 3** (card branco)
- 3 tarefas escolhidas pro dia
- Checkbox interativo
- Tag indicando contexto (Agência, Foguete, Empresa)
- Regra TDAH: nunca mais que 3

**3. Agência** (card branco)
- Lista de clientes com nome + receita + barra proporcional
- Total no rodapé
- Dados atuais: Grupo Expo R$7k, Centurião R$3.2k, Tojiro Mooca R$2.2k, Tojiro ZN R$1.5k, Mecânica Primus R$690, Poeticamente R$500 = R$15.090/mês

**4. Mapa da Liberdade** (card branco)
- Fase atual (badge)
- Barra de progresso: SaaS MRR atual → meta R$8.340/mês
- Marcos com dots (checkbox visual) e valores
- Motivacional mas com números reais

**5. Pendências de empresa** (card full-width, 2 colunas)
- Checklist de burocracias: CNPJs, contratos, splits
- Formato simples, sem prioridade (tudo precisa ser feito)

### Chat IA (painel lateral direito, 360px)

- Header com status (online/offline)
- Histórico de mensagens (bolhas)
- Sugestões rápidas ("onde eu parei?", "organiza meu inbox", "o que falta no AdvocaciaIA?")
- Input de texto + botão enviar
- Quando o agente modifica dados, mostra badge "Atualizei o card X"
- Backend: Claude API (Anthropic) com contexto do banco de dados do Esmeralda
- O agente pode: criar/editar/remover tarefas, atualizar receitas, mover itens, responder perguntas sobre projetos

## Arquitetura técnica

### Frontend
- HTML/CSS/JS estático (sem framework pesado)
- Tailwind ou CSS custom (neutro quente)
- Lucide icons
- Hospedado em Hostinger: `tracktor.com.br/esmeralda/`
- Deploy via GitHub Actions (mesmo pipeline do ecossistema-max)

### Backend (API na VPS)
- Node.js na VPS 76.13.172.151
- SQLite para dados (clientes, tarefas, receitas, pendências) — leve, zero config, suficiente pra usuário único
- Endpoints REST:
  - `GET /api/dashboard` — dados do painel
  - `POST /api/tasks` — criar tarefa
  - `PATCH /api/tasks/:id` — atualizar tarefa
  - `GET /api/clients` — clientes da agência
  - `PATCH /api/clients/:id` — atualizar cliente
  - `GET /api/milestones` — marcos do mapa
  - `POST /api/chat` — enviar mensagem pro agente IA
- Autenticação: token simples (só Max por enquanto), JWT no futuro

### Agente IA
- Claude API (Anthropic SDK)
- System prompt com contexto completo: quem é Max, TDAH, projetos, regras
- Function calling pra ler/escrever no banco de dados
- Streaming de resposta pra UX fluida
- Histórico de chat persistente

## Dados iniciais (seed)

Preencher o banco com os dados atuais do Max:

**Clientes agência:**
- Grupo Expo: R$7.000 (ALERTA nota fria)
- Centurião: R$3.200
- Tojiro Mooca: R$2.200
- Tojiro Zona Norte: R$1.500
- Mecânica Primus: R$690
- Poeticamente: R$500

**Projetos SaaS:**
- AdvocaciaIA: 1 cliente (Daiane), meta 50, R$169/mês, sócia Daiane 40%
- CorretorIA: 0 clientes, em desenvolvimento, sócia Amanda 40%

**Urgências:**
- Cobrar Gustavo — CNPJ novo

**Pendências:**
- CNPJ novo, CNPJ AdvocaciaIA, CNPJ CorretorIA, contratos sociais, definir split

## Fora de escopo (v1)

- Multi-tenant / login de clientes
- Integração direta com Obsidian
- Integração com Meta Ads
- App mobile
- Notificações push

## Referência visual

Mockup aprovado em `.superpowers/brainstorm/31017-1777225936/content/mockup-painel-v2-chat.html`
