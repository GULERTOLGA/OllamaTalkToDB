import { Router } from 'express';
import type { ChatRequest } from '../../shared/src/types.js';

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';

export const chatRouter = Router();

chatRouter.post('/chat', async (req, res) => {
  try {
    const body: ChatRequest = req.body;
    const { model = 'qwen3:4b', messages, stream = false, systemPrompt } = body;

    const finalMessages =
      systemPrompt?.trim()
        ? [{ role: 'system' as const, content: systemPrompt.trim() }, ...messages]
        : messages;

    const ollamaResponse = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: finalMessages,
        stream,
      }),
    });

    if (!ollamaResponse.ok) {
      const err = await ollamaResponse.text();
      return res.status(ollamaResponse.status).json({
        error: 'Ollama hatası',
        details: err,
      });
    }

    const data = await ollamaResponse.json();
    res.json(data);
  } catch (error) {
    console.error('Chat hatası:', error);
    res.status(500).json({
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata',
    });
  }
});
