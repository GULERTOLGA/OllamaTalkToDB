# Chat panel (`@ollama-chat/chatpanel`)

Harita sayfalarına gömülebilen Shadow DOM tabanlı sohbet paneli. Tek giriş noktası `src/main.ts`; Vite ile **IIFE** olarak `dist/chat-panel.js` üretilir ve `window.ChatPanel` API’sini dışa açar.

## Klasör yapısı

```text
chatpanel/
├── index.html              # Yerel geliştirme için minimal sayfa
├── package.json
├── vite.config.ts          # lib entry: src/main.ts → chat-panel.js (IIFE)
├── tsconfig.json
└── src/
    ├── main.ts             # init, seçenek çözümleme, binder’lar, window.ChatPanel
    ├── vite-env.d.ts
    ├── features/           # Davranış modülleri
    │   ├── geoJsonMapLayers.ts   # Haritaya GeoJSON, lejant, etiket, pulse
    │   ├── mapMagnifier.ts       # Harita büyüteci lens + araç çubuğu bağlama
    │   ├── n8nNews.ts            # Haber/sosyal sekmesi, cache, fetch
    │   ├── panelChatN8n.ts       # Form sohbeti, n8n POST, köşeli parantez linkleri
    │   └── searchScanOverlay.ts  # Tam ekran “tarama” overlay (yüklenirken)
    ├── services/
    │   └── map/
    │       └── registry.ts       # Aktif harita adı, getRegisteredMap / getMaplibre
    ├── shared/
    │   └── utils/
    │       └── textAndDom.ts     # escapeHtml, isPlainObject, scrollMessagesToEnd
    └── ui/
        └── panelShell.ts         # ROOT_ID, shadow stilleri, panel HTML iskeleti
```

## Modül özeti

| Alan | Dosya | Sorumluluk |
|------|--------|------------|
| Giriş | `main.ts` | `initChatPanel`, URL/script’ten seçenekler, sekmeler, WISART, temizle, karşılama mesajı |
| Harita verisi | `features/geoJsonMapLayers.ts` | Kaynak/katman ekleme-kaldırma, faaliyet renkleri, lejant DOM’u |
| Büyüteç | `features/mapMagnifier.ts` | Lens, stil senkronu; köşeli link delegasyonu `main` üzerinden enjekte edilir |
| Haberler | `features/n8nNews.ts` | `/news` proxy, localStorage cache, tab içerik render |
| Sohbet | `features/panelChatN8n.ts` | Mesaj formu, `postChatToN8n`, AI balonu HTML |
| Overlay | `features/searchScanOverlay.ts` | Global tarama animasyonu |
| Registry | `services/map/registry.ts` | `window.__ncMapRegistry__[name]` ve `window.maplibregl` |
| Yardımcılar | `shared/utils/textAndDom.ts` | Ortak string/DOM util’leri |
| Kabuk | `ui/panelShell.ts` | Bootstrap linki, panel CSS, `createPanelMarkup` |

## Komutlar

| Komut | Açıklama |
|--------|-----------|
| `npm run dev` | Vite dev sunucusu (varsayılan port: `vite.config.ts`) |
| `npm run build` | `tsc --noEmit` + üretim bundle’ı `dist/chat-panel.js` |
| `npm run build:embed` | Build + `../frontend/public/chat-panel.js` kopyası |
| `npm run preview` | Üretim önizleme |

## Gömme

Ana uygulama genelde `frontend/public/chat-panel.js` üzerinden script etiketi ile yükler. Harita örneği `window.__ncMapRegistry__[mapInstanceName]` ile kayıtlı olmalıdır; panel `data-map-instance` veya `init` seçenekleriyle bu adı kullanır.
