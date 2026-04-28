export const TOOLS = [
  {
    name: 'get_dashboard',
    description: 'Busca todos os dados do painel: clientes, tarefas, projetos, marcos e pendências',
    input_schema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'create_task',
    description: 'Cria uma nova tarefa. type: "hoje" (máx 3), "urgente" ou "backlog". category: agencia, foguete, empresa, geral. client_id opcional pra associar a um cliente.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Título da tarefa' },
        subtitle: { type: 'string', description: 'Descrição opcional' },
        category: { type: 'string', enum: ['agencia', 'foguete', 'empresa', 'geral'] },
        type: { type: 'string', enum: ['hoje', 'urgente', 'backlog'] },
        client_id: { type: 'number', description: 'ID do cliente da agência (opcional)' }
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
  },
  {
    name: 'list_obsidian',
    description: 'Lista os arquivos .md do vault do Obsidian do Max. Estrutura: Inbox/, Agencia/ (clientes), Projetos/ (foguetes/SaaS). Use quando o Max perguntar sobre notas, inbox, ou referencias do Obsidian.',
    input_schema: {
      type: 'object',
      properties: {
        folder: { type: 'string', description: 'Pasta opcional pra filtrar (ex: "Inbox", "Agencia", "Projetos"). Se omitido lista raiz.' }
      },
      required: []
    }
  },
  {
    name: 'read_obsidian',
    description: 'Le o conteudo de uma nota .md do vault do Obsidian. Use o caminho relativo, ex: "Inbox/Inbox Pessoal.md" ou "Agencia/Tojiro Mooca.md".',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Caminho relativo do arquivo .md dentro do vault' }
      },
      required: ['path']
    }
  },
  {
    name: 'append_obsidian',
    description: 'Adiciona conteudo no FINAL de uma nota existente do Obsidian. Bom pra log de conversas com clientes, notas em ordem cronologica. Cria o arquivo se nao existir.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Caminho relativo do arquivo .md' },
        content: { type: 'string', description: 'Conteudo a adicionar (sera precedido por uma quebra de linha)' }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'remove_inbox_line',
    description: 'Remove uma linha especifica de um arquivo do Inbox/. Use quando o Max marcar um item como concluido/migrado. Match exato da linha (sem espacos extras).',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Caminho do arquivo no Inbox/' },
        line: { type: 'string', description: 'Texto exato da linha a remover (sem o "- " inicial)' }
      },
      required: ['path', 'line']
    }
  },
  {
    name: 'write_journal',
    description: 'Cria/atualiza o diario do dia em Diario/YYYY-MM-DD.md com resumo das tarefas feitas, pendentes, e conversas relevantes do chat. Use quando o Max disser "fecha o dia" ou "encerra o dia".',
    input_schema: {
      type: 'object',
      properties: {
        summary: { type: 'string', description: 'Texto markdown completo do diario (com sections: Feito, Pendente, Conversas/Notas)' }
      },
      required: ['summary']
    }
  }
];
