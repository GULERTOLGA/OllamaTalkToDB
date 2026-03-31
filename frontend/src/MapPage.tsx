import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './nc_styles.css';

/** Chat panel ve eklentiler MapLibre API’ye ihtiyaç duyarsa kullanır (marker zorunlu değil). */
if (typeof window !== 'undefined') {
  window.maplibregl = maplibregl;
}

const ALANYA_CENTER: [number, number] = [31.9998, 36.5441];
const ALANYA_STYLE_URL = 'http://localhost:59951/style/alanyavector4';

const CHATPANEL_SCRIPT_ID = 'nc_map_chatpanel_script';

const N8N_PROXY_URL =
  (import.meta.env.VITE_N8N_PROXY_URL as string | undefined)?.trim() ||
  'http://localhost:3001/api/n8n';

function chatPanelScriptSrc(): string {
  const base = import.meta.env.BASE_URL ?? '/';
  const normalized = base.endsWith('/') ? base : `${base}/`;
  return `${normalized}chat-panel.js`;
}

declare global {
  interface Window {
    maplibregl?: typeof maplibregl;
    ChatPanel?: {
      init: (options?: {
        container?: HTMLElement;
        mapInstanceName?: string;
        n8nProxyUrl?: string;
      }) => HTMLElement;
      getMapInstanceName: () => string | null;
      getRegisteredMap: () => unknown | null;
      getMaplibre: () => unknown;
    };
    __ncMapRegistry__?: Record<string, maplibregl.Map>;
  }
}

const DEFAULT_MAP_INSTANCE = 'alanyaMap';

export function MapPage() {
  const mapInstanceName = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mapInstance')?.trim() || DEFAULT_MAP_INSTANCE;
  }, []);

  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const firstLayerIdRef = useRef<string | null>(null);
  const satelliteOnRef = useRef(true);
  const [satelliteOn, setSatelliteOn] = useState(true);
  satelliteOnRef.current = satelliteOn;

  const applySatelliteVisibility = useCallback((visible: boolean) => {
    const map = mapRef.current;
    const layerId = firstLayerIdRef.current;
    if (!map || !layerId || !map.getLayer(layerId)) return;
    try {
      map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
    } catch {
      /* bazı özel katman tipleri layout visibility desteklemeyebilir */
    }
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: ALANYA_STYLE_URL,
      center: ALANYA_CENTER,
      zoom: 12,
      maxZoom: 19,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    new maplibregl.Marker({ color: '#d90429' }).setLngLat(ALANYA_CENTER).addTo(map);

    const onStyleReady = () => {
      const layers = map.getStyle()?.layers;
      const first = layers?.[0];
      if (first?.id) {
        firstLayerIdRef.current = first.id;
        applySatelliteVisibility(satelliteOnRef.current);
      }
    };

    map.once('load', onStyleReady);

    mapRef.current = map;

    window.__ncMapRegistry__ = window.__ncMapRegistry__ ?? {};
    window.__ncMapRegistry__[mapInstanceName] = map;

    return () => {
      map.remove();
      mapRef.current = null;
      firstLayerIdRef.current = null;
      delete window.__ncMapRegistry__?.[mapInstanceName];
    };
  }, [applySatelliteVisibility, mapInstanceName]);

  useEffect(() => {
    applySatelliteVisibility(satelliteOn);
  }, [satelliteOn, applySatelliteVisibility]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loadChat = params.get('chat') === 'true';
    if (!loadChat) {
      return;
    }

    const opts = { mapInstanceName, n8nProxyUrl: N8N_PROXY_URL };

    let script = document.getElementById(CHATPANEL_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = CHATPANEL_SCRIPT_ID;
      script.src = chatPanelScriptSrc();
      script.async = true;
      script.setAttribute('data-map-instance', mapInstanceName);
      script.setAttribute('data-n8n-proxy', N8N_PROXY_URL);
      document.body.appendChild(script);
    } else if (window.ChatPanel) {
      window.ChatPanel.init(opts);
    }

    return () => {
      document.getElementById('nc_chatpanel_root')?.remove();
      document.getElementById('nc_chatpanel_styles')?.remove();
      document.getElementById(CHATPANEL_SCRIPT_ID)?.remove();
      delete window.ChatPanel;
    };
  }, [mapInstanceName]);

  return (
    <div className="nc_map_page">
      <div className="nc_map_toolbar">
        <a href="/" className="nc_map_back_btn">
          Geri Dön
        </a>
        <span className="nc_map_title">Alanya Haritası</span>
        <label className="nc_map_satellite_toggle">
          <input
            type="checkbox"
            className="nc_map_satellite_checkbox"
            checked={satelliteOn}
            onChange={(e) => setSatelliteOn(e.target.checked)}
          />
          <span className="nc_map_satellite_label">Uydu (Google)</span>
        </label>
      </div>
      <div ref={mapContainerRef} className="nc_map_container" />
    </div>
  );
}
