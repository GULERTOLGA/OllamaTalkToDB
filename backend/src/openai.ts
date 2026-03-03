import { Router } from 'express';

const router = Router();
const OPENAI_API_URL = 'https://api.openai.com/v1/responses';

function getOpenAIConfig() {
  return {
    promptId: process.env.OPENAI_PROMPT_ID ?? '',
    promptVersion: process.env.OPENAI_PROMPT_VERSION ?? '2',
  };
}

function extractTextFromResponse(data: {
  output?: Array<{
    type?: string;
    role?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
}): string {
  const parts: string[] = [];
  for (const item of data.output ?? []) {
    if (item.type === 'message' && Array.isArray(item.content)) {
      for (const block of item.content) {
        if (block.type === 'output_text' && typeof block.text === 'string') {
          parts.push(block.text);
        }
      }
    }
  }
  return parts.join('\n').trim() || '(Boş yanıt)';
}

router.post('/test-openai', async (req, res) => {
  try {
    const { text } = req.body as { text?: string };
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Body\'de "text" (string) gerekli.' });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY tanımlı değil.' });
    }
    const { promptId, promptVersion } = getOpenAIConfig();
    if (!promptId) {
      return res.status(500).json({ error: 'OPENAI_PROMPT_ID tanımlı değil.' });
    }

    const body = {
      prompt: {
        id: promptId,
        version: promptVersion,
      },
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text,
            },
          ],
        },
      ],
      reasoning: { summary: null },
      store: false,
      include: ['reasoning.encrypted_content', 'web_search_call.action.sources'],
    };

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`OpenAI API ${response.status}: ${errBody}`);
    }

    const data = (await response.json()) as Parameters<typeof extractTextFromResponse>[0];
    const outputText = extractTextFromResponse(data);
    res.json({ text: outputText });
  } catch (err) {
    console.error('OpenAI test-openai hatası:', err);
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
    res.status(500).json({ error: 'OpenAI hatası', details: message });
  }
});

export const openaiRouter = router;
