import { Router } from 'express';
import multer from 'multer';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const upload = multer({
  storage: multer.diskStorage({
    destination: async (_req, _file, cb) => {
      const dir = await mkdtemp(path.join(os.tmpdir(), 'stt-'));
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.webm';
      cb(null, `audio${ext}`);
    },
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const router = Router();

function getPythonBin(): string {
  return process.env.PYTHON_BIN ?? 'python3';
}

function transcribeScriptPath(): string {
  return path.resolve(__dirname, '..', 'scripts', 'transcribe_audio.py');
}

function parseTranscribeJson(raw: string): { ok?: boolean; text?: string; engine?: string; error?: string } | null {
  const s = raw.trim();
  if (!s) return null;
  try {
    return JSON.parse(s) as { ok?: boolean; text?: string; engine?: string; error?: string };
  } catch {
    return null;
  }
}

async function runTranscribe(audioPath: string): Promise<{ text: string; engine?: string }> {
  const script = transcribeScriptPath();
  const py = getPythonBin();

  const mergedEnv = {
    ...process.env,
    PYTHONWARNINGS: [
      process.env.PYTHONWARNINGS,
      'ignore::urllib3.exceptions.NotOpenSSLWarning',
    ]
      .filter(Boolean)
      .join(','),
  };

  return new Promise((resolve, reject) => {
    const proc = spawn(py, [script, audioPath], {
      env: mergedEnv,
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.setEncoding('utf8').on('data', (c) => { stdout += c; });
    proc.stderr.setEncoding('utf8').on('data', (c) => { stderr += c; });
    proc.on('error', reject);
    proc.on('close', (code) => {
      const data = parseTranscribeJson(stdout);

      if (data?.ok === false) {
        return reject(new Error(data.error ?? 'Transkripsiyon başarısız'));
      }

      if (code === 0) {
        if (data?.ok) {
          return resolve({ text: data.text ?? '', engine: data.engine });
        }
        return reject(new Error(`Geçersiz JSON: ${stdout.slice(0, 500)}`));
      }

      if (data?.ok) {
        return resolve({ text: data.text ?? '', engine: data.engine });
      }
      const fallback = stderr.trim() || stdout.trim() || `Python exit ${code}`;
      return reject(new Error(fallback));
    });
  });
}

router.post('/speech-to-text', upload.single('audio'), async (req, res) => {
  const file = req.file;
  if (!file?.path) {
    return res.status(400).json({ ok: false, error: 'multipart/form-data ile "audio" dosyası gerekli.' });
  }

  try {
    const { text, engine } = await runTranscribe(file.path);
    res.json({ ok: true, text, engine });
  } catch (err) {
    console.error('speech-to-text hatası:', err);
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
    res.status(500).json({ ok: false, error: message });
  } finally {
    try {
      const dir = path.dirname(file.path);
      await rm(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
});

export const speechRouter = router;
