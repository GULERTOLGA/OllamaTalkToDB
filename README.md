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

---

## Pinecone Script'leri (Tablo Şeması → Vektör Index)

Veritabanı tablolarının sütun listesini OpenAI ile anlamlı metin açıklamalarına çevirip Pinecone index'ine eklemek için iki script kullanılır.

### Genel akış

1. **Sütun listesi dosyası** (`kentrehberi_columns2.txt`): `table_name;ordinal_position;column_name;data_type` formatında, noktalı virgülle ayrılmış tablo/sütun listesi.
2. **generate** → Her tablo için backend'deki `/api/test-openai` endpoint'ine istek atar; dönen metinlerle Pinecone'a uygun bir JSON dosyası üretir.
3. **insert** → Bu JSON dosyasını Pinecone Integrated Embedding index'ine upsert eder (vektörleştirmeyi Pinecone yapar).

### 1. `pinecone:generate` — Pinecone kayıt JSON'unu üretme

Tablo listesini okuyup her tablo için OpenAI (test-openai) ile açıklama metni alır ve `pinecone-records.json` oluşturur.

**Gereksinimler:**

- Backend çalışıyor olmalı (`npm run dev`)
- `backend/.env` içinde: `OPENAI_API_KEY`, `OPENAI_PROMPT_ID` (test-openai bu değerleri kullanır)

**Ortam değişkenleri (opsiyonel):**

| Değişken | Varsayılan | Açıklama |
|----------|------------|----------|
| `COLUMNS_FILE` | `../kentrehberi_columns2.txt` | Sütun listesi dosyası (script'e göre yol) |
| `OUTPUT_FILE` | `./pinecone-records.json` | Üretilecek JSON dosyası |
| `API_BASE_URL` | `http://localhost:3001` | Backend base URL (frontend proxy kullanıyorsanız `http://localhost:5175` yapabilirsiniz) |
| `REQUEST_DELAY_MS` | `500` | İstekler arası bekleme (ms) |

**Kullanım:**

```bash
cd backend
npm run pinecone:generate
```

Çıktı: `backend/scripts/pinecone-records.json` — her tablo için `id`, `text`, `metadata` (Pinecone upsert formatı).

---

### 2. `pinecone:insert` — JSON'u Pinecone'a yükleme

Üretilen (veya el ile hazırlanan) JSON dosyasındaki kayıtları Pinecone index'ine upsert eder. Integrated Embedding kullanıldığı için sadece `text` gönderilir; vektörleri Pinecone oluşturur.

**Gereksinimler:**

- `backend/.env` içinde: `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`
- Pinecone index'iniz Integrated Embedding (örn. `llama-text-embed-v2`) ve `text` alanına göre yapılandırılmış olmalı

**Ortam değişkenleri (opsiyonel):**

| Değişken | Varsayılan | Açıklama |
|----------|------------|----------|
| `PINECONE_NAMESPACE` | `""` | Namespace (boş = varsayılan; 2025-04 öncesi API'de `__default__` kullanılamaz) |
| `RECORDS_FILE` | `scripts/pinecone-records.json` | Yüklenecek JSON dosyası (script ile aynı dizine göre) |
| `SAMPLE_COUNT` | `5` | `RECORDS_FILE` yoksa üretilecek örnek kayıt sayısı |

**Kullanım:**

```bash
cd backend
npm run pinecone:insert
```

Varsayılan olarak `backend/scripts/pinecone-records.json` kullanılır. Farklı dosya için:

```bash
RECORDS_FILE=./baskabir.json npm run pinecone:insert
```

**JSON formatı:** Her eleman `{ "id": "tablo_adi", "text": "TABLE: ... açıklama metni ...", "metadata": { "table_name": "...", "geom": "polygon" } }` şeklinde olmalıdır.

---

### Örnek tam akış

```bash
# 1) Backend'i başlat (başka terminalde)
cd backend && npm run dev

# 2) Tablo listesinden Pinecone kayıt JSON'unu üret
cd backend && npm run pinecone:generate

# 3) Üretilen JSON'u Pinecone index'ine yükle
cd backend && npm run pinecone:insert
```
