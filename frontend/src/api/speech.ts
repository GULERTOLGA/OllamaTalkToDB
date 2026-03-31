const API_BASE = '/api';

export type SpeechToTextResult = {
  ok: boolean;
  text?: string;
  engine?: string;
  error?: string;
};

export const speechApi = {
  async transcribeAudio(blob: Blob, filename = 'recording.webm'): Promise<SpeechToTextResult> {
    const form = new FormData();
    form.append('audio', blob, filename);

    const res = await fetch(`${API_BASE}/speech-to-text`, {
      method: 'POST',
      body: form,
    });

    const data = (await res.json()) as SpeechToTextResult;
    if (!res.ok) {
      return { ok: false, error: data.error ?? res.statusText };
    }
    return data;
  },
};
