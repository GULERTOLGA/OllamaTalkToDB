# Ollama Chat Uygulaması

Ollama 3B modeli ile sohbet yapabileceğiniz basit bir uygulama.

## Gereksinimler

- [Node.js](https://nodejs.org/) 18+
- [Ollama](https://ollama.ai/) kurulu ve çalışıyor olmalı
- `llama3.2:3b` modeli: `ollama pull llama3.2:3b`

## Kurulum

```bash
# Kök dizinde
npm install

# Backend ve frontend için ayrı ayrı
cd backend && npm install
cd ../frontend && npm install
```

## Çalıştırma

1. **Ollama'yı başlatın** (varsayılan: http://localhost:11434)

2. **Backend** (port 3001):
   ```bash
   cd backend
   npm run dev
   ```

3. **Frontend** (port 5173) - ayrı terminal:
   ```bash
   cd frontend
   npm run dev
   ```

4. Tarayıcıda http://localhost:5173 adresine gidin.

İsterseniz kök dizinden her ikisini birlikte başlatmak için:
```bash
npm run dev
```

## Proje Yapısı

```
├── shared/          # Ortak domain katmanı (ChatMessage, ChatRequest, vb.)
│   └── src/
│       └── types.ts
├── backend/         # Express API, Ollama proxy
├── frontend/        # React + TypeScript + Vite + Bootstrap
```

## Model Değiştirme

Üst menüdeki dropdown'dan farklı modeller seçebilirsiniz. Ollama'da mevcut modelleri görmek için: `ollama list`
