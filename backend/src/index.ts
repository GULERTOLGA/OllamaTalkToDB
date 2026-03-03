import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: true });

import express from 'express';
import cors from 'cors';
import { chatRouter } from './chat.js';
import { openaiRouter } from './openai.js';

const app = express();
const PORT = 3001;

app.use(cors({ origin: true }));
app.use(express.json());
app.use('/api', chatRouter);
app.use('/api', openaiRouter);

app.listen(PORT, () => {
  console.log(`Backend çalışıyor: http://localhost:${PORT}`);
});
