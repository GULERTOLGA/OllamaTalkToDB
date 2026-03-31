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
# Chat panel paketi (isteğe bağlı)
cd ../chatpanel && npm install
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

### Chat panel (haritada gömülü)

`chatpanel/` ayrı bir **TypeScript + Vite** paketidir; tek dosya **IIFE** (`dist/chat-panel.js`) üretir ve herhangi bir sayfada `<script src="...">` ile yüklenebilir. Panel, sayfanın **sağ alt köşesinde** sabitlenir.

| Ne | Açıklama |
|----|----------|
| Geliştirme sunucusu | Port **5174** (`cd chatpanel && npm run dev`) |
| Kökten | `npm run dev:chatpanel` |
| Üretim paketi | `cd chatpanel && npm run build` → `chatpanel/dist/chat-panel.js` |

**Harita sayfası:** `http://localhost:5173/map?chat=true` adresinde `MapPage`, `frontend/public/chat-panel.js` dosyasını yükleyerek paneli açar; **`chat=true` yoksa** chat panel yüklenmez (sadece harita). İsteğe bağlı sorgu parametresi **`mapInstance`**: harita `maplibregl.Map` örneği `window.__ncMapRegistry__[mapInstance]` altına konur (varsayılan ad: `alanyaMap`). Chat panel aynı adı `data-map-instance` ve `ChatPanel.getMapInstanceName()` ile bilir. Örnek: `/map?chat=true&mapInstance=myMap`. Gönder ile metin, backend **`POST /api/n8n`** (form-data `chatInput`) üzerinden n8n’e iletilir; yanıt şimdilik tarayıcı **konsoluna** yazılır. Yerel proxy varsayılanı: `http://localhost:3001/api/n8n`. Frontend’de `VITE_N8N_PROXY_URL` ile değiştirilebilir. Panel kodunu `chatpanel` içinde değiştirdikten sonra dosyayı `public` altına kopyalayın:

```bash
cd chatpanel
npm run build:embed
```

(`build` + `frontend/public/chat-panel.js` kopyası)

**Başka bir sitede / statik HTML’de manuel gömme:**

```html
<script src="https://sunucu-adresiniz/chat-panel.js" data-map-instance="myMap"></script>
```

Harita örneğine kod tarafında `window.__ncMapRegistry__.myMap` (veya seçtiğiniz ad) ile erişin; panel `window.ChatPanel.getMapInstanceName()` ile aynı adı okuyabilir. Panel içinden harita ile çalışmak için: `window.ChatPanel.getRegisteredMap()` (kayıtlı `maplibregl.Map`), isteğe bağlı `window.ChatPanel.getMaplibre()` veya doğrudan `window.maplibregl` (bu projede `MapPage` atar).

Otomatik yükleme istemezseniz:

```html
<script src="https://sunucu-adresiniz/chat-panel.js" data-auto-init="false"></script>
<script>window.ChatPanel?.init();</script>
```

## Proje Yapısı

```
├── shared/          # Ortak domain katmanı (ChatMessage, ChatRequest, vb.)
│   └── src/
│       └── types.ts
├── backend/         # Express API, Ollama proxy
├── frontend/        # React + TypeScript + Vite + Bootstrap
├── chatpanel/       # Gömülebilir sohbet paneli (IIFE bundle, ayrı port ile dev)
```

## Model Değiştirme

Üst menüdeki dropdown'dan farklı modeller seçebilirsiniz. Ollama'da mevcut modelleri görmek için: `ollama list`

---

## Ses → Metin (Speech-to-text)

Uygulamada **Ses → Metin** sekmesiyle tarayıcıdan mikrofonla kayıt alınır; ses dosyası backend’e yüklenir ve **açık kaynak Whisper** tabanlı transkripsiyonla metne çevrilir.

### Backend

- **POST** `/api/speech-to-text` — `multipart/form-data`, alan adı: **`audio`** (ses dosyası)
- Sunucu `backend/scripts/transcribe_audio.py` ile çalıştırır:
  - **Öncelik (Apple Silicon + MLX):** `mlx-whisper` — `pip install mlx-whisper`
  - **Yedek (CPU):** `faster-whisper` — `pip install faster-whisper`
- Çoğu formatta decode için sistemde **ffmpeg** bulunması önerilir.
- Opsiyonel ortam değişkenleri:
  - `PYTHON_BIN` — Python yolu (varsayılan `python3`)
  - `WHISPER_BACKEND` — `auto` \| `mlx` \| `faster` (varsayılan `auto`)
  - `WHISPER_LANGUAGE` — Whisper dil kodu (varsayılan `tr`; otomatik algılama için `auto`)
  - `MLX_WHISPER_MODEL` — varsayılan `mlx-community/whisper-small-mlx` (Apple Silicon’da Türkçe için uygun denge)
  - `FASTER_WHISPER_MODEL` — varsayılan `small` (`faster-whisper` MPS kullanmaz; Mac’te hız için öncelikle MLX)
  - `FASTER_WHISPER_DEVICE` / `FASTER_WHISPER_COMPUTE` — yedek motor için (örn. `cpu`, `int8`)

Örnek:

```bash
pip install mlx-whisper
# veya
pip install faster-whisper
```

---

## DB Şema API (PostgreSQL)

Backend, PostgreSQL’e bağlanıp verilen tablo isimleri için şema (kolon listesi) döndüren bir endpoint içerir.

### Endpoint

- **POST** `/api/db/schema`
- **Body**
  - `tables`: `string[]` (zorunlu) — `["public.geomahalle", "kentrehberi_yol"]` gibi
  - `defaultSchema`: `string` (opsiyonel, varsayılan `public`) — şemasız isimler için kullanılacak şema

### Örnek istek

```bash
curl -X POST http://localhost:3001/api/db/schema \
  -H 'Content-Type: application/json' \
  -d '{"tables":["geomahalle","public.kentrehberi_yol"],"defaultSchema":"public"}'
```

### DB bağlantısı (env)

`backend/.env` içinde aşağıdakilerden birini tanımlayın:

- `DATABASE_URL=postgres://user:pass@host:5432/dbname`
- veya `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

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

---

### 3. Pinecone Arama ve Rerank

Uygulamada **Pinecone Arama** sekmesiyle index içinde metin araması yapılır. Arama isteği `POST /api/pinecone/search` ile gider; sonuçlar isteğe bağlı olarak **yerel rerank** ile yeniden sıralanır.

**Rerank nedir?**  
Önce Pinecone vektör benzerliğine göre ilk N sonuç alınır; ardından bu sonuçlar **cross-encoder** (bge-reranker) ile sorguya göre yeniden skorlanıp sıralanır. Böylece ilk sıralar daha isabetli olur.

**Nasıl çalışır?**

- **Rerank kapalı:** Sadece Pinecone’un döndürdüğü sıra kullanılır.
- **Rerank açık:** Backend, Pinecone sonuçlarını alır; her döküman metnini 1024 token sınırına uyması için kısaltır (≈2400 karakter), sonra **TypeScript** içinde **@huggingface/transformers** ile `Xenova/bge-reranker-base` modelini çalıştırarak skorları hesaplar ve sonuçları bu skora göre sıralar.

**Neden yerel rerank?**  
Pinecone’un sunucu tarafı rerank’ı (bge-reranker-v2-m3) sorgu+döküman için **1024 token** sınırına takılır; tablo açıklamaları uzun olduğu için 400 hatası alınır. Yerel rerank’ta metinler kısaltıldığı için bu sınır aşılmaz.

**Gereksinimler:**

- Rerank kullanacaksanız backend’de `@huggingface/transformers` (projede zaten var) yeterli; **Python veya sentence-transformers gerekmez.**
- İlk çalıştırmada model indirilir; sonra tamamen lokal çalışır.

**Arayüzde:**

- **Rerank kullan** kutusu işaretliyse arama sonuçları yerel rerank ile sıralanır.
- **Rerank sonuç sayısı (top_n)** ile kaç sonucun bu sıralamaya göre döneceği seçilir.
