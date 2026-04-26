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
  }
];
