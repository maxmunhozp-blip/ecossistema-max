import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import db from '../db.js';
import { SYSTEM_PROMPT } from '../agent/system-prompt.js';
import { TOOLS } from '../agent/tools.js';
import { executeTool } from '../agent/executor.js';

const router = Router();
const client = new Anthropic();

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  // Save user message
  db.prepare('INSERT INTO chat_messages (role, content) VALUES (?, ?)').run('user', message);

  // Get recent history (last 20 messages)
  const history = db.prepare('SELECT role, content FROM chat_messages ORDER BY id DESC LIMIT 20').all().reverse();

  const messages = history.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));

  try {
    // Agentic loop: keep calling Claude until no more tool_use
    let currentMessages = [...messages];
    let finalText = '';
    let toolActions = [];

    for (let i = 0; i < 5; i++) { // max 5 tool rounds
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        messages: currentMessages
      });

      const textBlocks = response.content.filter(b => b.type === 'text');
      const toolBlocks = response.content.filter(b => b.type === 'tool_use');

      if (textBlocks.length > 0) {
        finalText += textBlocks.map(b => b.text).join('');
      }

      if (toolBlocks.length === 0) break; // No more tools, done

      // Execute tools and build tool_result messages
      const toolResults = [];
      for (const tool of toolBlocks) {
        const result = executeTool(tool.name, tool.input);
        toolActions.push({ tool: tool.name, input: tool.input, result });
        toolResults.push({
          type: 'tool_result',
          tool_use_id: tool.id,
          content: JSON.stringify(result)
        });
      }

      // Add assistant response + tool results to messages for next round
      currentMessages = [
        ...currentMessages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults }
      ];
    }

    // Save assistant response
    if (finalText) {
      db.prepare('INSERT INTO chat_messages (role, content) VALUES (?, ?)').run('assistant', finalText);
    }

    res.json({
      message: finalText,
      actions: toolActions.map(a => ({ tool: a.tool, description: describeAction(a) }))
    });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Erro no chat. Tente novamente.' });
  }
});

function describeAction(action) {
  const map = {
    get_dashboard: 'Li os dados do painel',
    create_task: `Criei tarefa: "${action.input.title}"`,
    update_task: 'Atualizei tarefa',
    delete_task: 'Removi tarefa',
    update_client: 'Atualizei cliente',
    toggle_pendencia: 'Atualizei pendência',
    toggle_milestone: 'Atualizei marco'
  };
  return map[action.tool] || action.tool;
}

export default router;
