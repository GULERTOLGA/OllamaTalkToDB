import { removeChatPanelGeoJsonFromMap } from './features/geoJsonMapLayers';
import { bindAudioTrackBar } from './features/audioPlayback';
import { bindAudioToggleButton } from './features/audioToggle';
import { bindWisartButton } from './features/kentrehberiWisart';
import {
  bindMapMagnifierButton,
  removeMapMagnifierLens,
  syncMapMagnifierButtonUi,
} from './features/mapMagnifier';
import { bindNewsButton, fetchN8nNewsAndLogConsole } from './features/n8nNews';
import { bindForm, ensureBracketCategoryLinkDelegation } from './features/panelChatN8n';
import { showSearchScanOverlay, hideSearchScanOverlay } from './features/searchScanOverlay';
import {
  getActiveMapInstanceName,
  getMaplibre,
  getRegisteredMap,
  setActiveMapInstanceName,
} from './services/map/registry';
import { ROOT_ID, createPanelMarkup, injectStyles } from './ui/panelShell';

export { showSearchScanOverlay, hideSearchScanOverlay, getRegisteredMap, getMaplibre };

const DEFAULT_N8N_PROXY_URL = 'http://localhost:3001/api/n8n';
const DEFAULT_DB_API_URL = 'http://localhost:3001/api';

const NC_CHAT_PANEL_WELCOME_AI =
  "Merhaba, Ben Alanya Belediyesi Kent Rehberi'niz Neco. Size nasıl yardımcı olabilirim?";

export type ChatPanelOptions = {
  /** Varsayılan: document.body */
  container?: HTMLElement;
  /** Otomatik init (varsayılan true) */
  autoInit?: boolean;
  /**
   * Harita host sayfasındaki örnek adı (ör. window.__ncMapRegistry__[name]).
   * Script etiketinde: data-map-instance="alanyaMap"
   */
  mapInstanceName?: string;
  /**
   * Backend n8n proxy (POST, form-data: chatInput).
   * Script: data-n8n-proxy="https://host/api/n8n"
   */
  n8nProxyUrl?: string;

  /**
   * Backend DB API base url (POST JSON).
   * Script: data-db-api="http://host:3001/api"
   */
  dbApiUrl?: string;
};

function resolveMapInstanceName(options: ChatPanelOptions): string | undefined {
  const fromOpt = options.mapInstanceName?.trim();
  if (fromOpt) return fromOpt;
  if (typeof document === 'undefined') return undefined;
  const el = document.currentScript as HTMLScriptElement | null;
  const fromScript = el?.getAttribute('data-map-instance')?.trim();
  if (fromScript) return fromScript;
  return undefined;
}

function resolveN8nProxyUrl(options: ChatPanelOptions): string {
  const fromOpt = options.n8nProxyUrl?.trim();
  if (fromOpt) return fromOpt;
  if (typeof document !== 'undefined') {
    const el = document.currentScript as HTMLScriptElement | null;
    const fromScript = el?.getAttribute('data-n8n-proxy')?.trim();
    if (fromScript) return fromScript;
  }
  return DEFAULT_N8N_PROXY_URL;
}

function resolveDbApiUrl(options: ChatPanelOptions): string {
  const fromOpt = options.dbApiUrl?.trim();
  if (fromOpt) return fromOpt;

  if (typeof document !== 'undefined') {
    const el = document.currentScript as HTMLScriptElement | null;
    const fromScript = el?.getAttribute('data-db-api')?.trim();
    if (fromScript) return fromScript;
  }

  return DEFAULT_DB_API_URL;
}

function resetChatPanelToInitialState(scope: ParentNode): void {
  removeMapMagnifierLens();
  const circleBtn = scope.querySelector<HTMLButtonElement>('#nc_chatpanel_map_circle_btn');
  if (circleBtn) syncMapMagnifierButtonUi(circleBtn, scope);

  const messages = scope.querySelector<HTMLElement>('#nc_chatpanel_messages');
  const input = scope.querySelector<HTMLInputElement>('#nc_chatpanel_input');

  if (messages) {
    messages.replaceChildren();
  }
  if (input) {
    input.value = '';
    input.disabled = false;
  }

  removeChatPanelGeoJsonFromMap();
  appendWelcomeAiMessageIfNeeded(scope);

  if (messages) {
    messages.scrollTop = 0;
  }
}

function bindClearPanelButton(scope: ParentNode): void {
  const btn = scope.querySelector<HTMLButtonElement>('#nc_chatpanel_clear_btn');
  if (!btn) return;
  if (btn.dataset.ncBoundClear === 'true') return;
  btn.dataset.ncBoundClear = 'true';

  btn.addEventListener('click', () => {
    resetChatPanelToInitialState(scope);
    console.log('[chatpanel] panel temizlendi');
  });
}

type ChatPanelTabId = 'kentrehberi' | 'haberler' | 'sosyal';

function bindTabBar(scope: ParentNode, n8nProxyUrl: string): void {
  const bar = scope.querySelector<HTMLElement>('.nc_chatpanel_tabbar');
  if (!bar || bar.dataset.ncBoundTabs === 'true') return;
  bar.dataset.ncBoundTabs = 'true';

  const btnKent = scope.querySelector<HTMLButtonElement>('#nc_chatpanel_tab_btn_kentrehberi');
  const btnHaberler = scope.querySelector<HTMLButtonElement>('#nc_chatpanel_tab_btn_haberler');
  const btnSosyal = scope.querySelector<HTMLButtonElement>('#nc_chatpanel_tab_btn_sosyal');
  const panelKent = scope.querySelector<HTMLElement>('#nc_chatpanel_tab_panel_kentrehberi');
  const panelHaberler = scope.querySelector<HTMLElement>('#nc_chatpanel_tab_panel_haberler');
  const panelSosyal = scope.querySelector<HTMLElement>('#nc_chatpanel_tab_panel_sosyal');
  if (!btnKent || !btnHaberler || !btnSosyal || !panelKent || !panelHaberler || !panelSosyal) return;

  const tabs: Array<{ id: ChatPanelTabId; btn: HTMLButtonElement; panel: HTMLElement }> = [
    { id: 'kentrehberi', btn: btnKent, panel: panelKent },
    { id: 'haberler', btn: btnHaberler, panel: panelHaberler },
    { id: 'sosyal', btn: btnSosyal, panel: panelSosyal },
  ];

  let lastActiveId: ChatPanelTabId = 'kentrehberi';

  const activate = (activeId: ChatPanelTabId): void => {
    for (const t of tabs) {
      const on = t.id === activeId;
      t.btn.classList.toggle('nc_chatpanel_tab_btn--active', on);
      t.btn.setAttribute('aria-selected', on ? 'true' : 'false');
      t.panel.classList.toggle('nc_chatpanel_tab_pane--active', on);
    }
  };

  for (const t of tabs) {
    t.btn.addEventListener('click', () => {
      if (t.id === lastActiveId) return;
      lastActiveId = t.id;
      activate(t.id);
      if (t.id === 'haberler' || t.id === 'sosyal') {
        void fetchN8nNewsAndLogConsole(scope, n8nProxyUrl, `sekme:${t.id}`);
      }
    });
  }
}

function appendWelcomeAiMessageIfNeeded(scope: ParentNode): void {
  const messages = scope.querySelector<HTMLElement>('#nc_chatpanel_messages');
  if (!messages) return;
  ensureBracketCategoryLinkDelegation(messages);
  if (messages.querySelector('[data-nc-welcome-ai="true"]')) return;

  const bubble = document.createElement('div');
  bubble.className = 'nc_chatpanel_msg nc_chatpanel_msg_ai';
  bubble.setAttribute('data-nc-welcome-ai', 'true');
  bubble.textContent = NC_CHAT_PANEL_WELCOME_AI;
  messages.prepend(bubble);
}

export function initChatPanel(options: ChatPanelOptions = {}): HTMLElement {
  const { container = document.body } = options;
  let root = document.getElementById(ROOT_ID) as HTMLElement | null;
  const mapName = resolveMapInstanceName(options);
  const n8nProxyUrl = resolveN8nProxyUrl(options);
  const dbApiUrl = resolveDbApiUrl(options);
  setActiveMapInstanceName(mapName ?? null);

  if (root) {
    if (mapName) root.setAttribute('data-nc-map-instance', mapName);
    const shadow = root.shadowRoot;
    if (shadow) {
      bindTabBar(shadow, n8nProxyUrl);
      bindAudioTrackBar(shadow);
      bindAudioToggleButton(shadow);
      bindWisartButton(shadow, dbApiUrl);
      bindNewsButton(shadow, n8nProxyUrl);
      bindMapMagnifierButton(shadow, { ensureBracketCategoryLinkDelegation });
      bindClearPanelButton(shadow);
      appendWelcomeAiMessageIfNeeded(shadow);
      // bindForm shadow içindeyse zaten data-ncBoundChat guard’ı ile tekrar kurmaz.
    }
    return root;
  }

  root = document.createElement('div');
  root.id = ROOT_ID;
  root.className = 'nc_chatpanel_root';
  root.setAttribute('data-nc-chatpanel', 'true');
  if (mapName) root.setAttribute('data-nc-map-instance', mapName);
  const shadow = root.attachShadow({ mode: 'open' });
  injectStyles(shadow);
  const panelWrap = document.createElement('div');
  panelWrap.className = 'nc_chatpanel_shell';
  panelWrap.innerHTML = createPanelMarkup();
  shadow.appendChild(panelWrap);
  container.appendChild(root);
  bindForm(shadow, n8nProxyUrl);
  bindTabBar(shadow, n8nProxyUrl);
  bindAudioTrackBar(shadow);
  bindAudioToggleButton(shadow);
  bindWisartButton(shadow, dbApiUrl);
  bindNewsButton(shadow, n8nProxyUrl);
  bindMapMagnifierButton(shadow, { ensureBracketCategoryLinkDelegation });
  bindClearPanelButton(shadow);
  appendWelcomeAiMessageIfNeeded(shadow);
  return root;
}

const globalApi = {
  init: (options?: ChatPanelOptions) => initChatPanel(options ?? {}),
  getMapInstanceName: (): string | null => getActiveMapInstanceName(),
  getRegisteredMap,
  getMaplibre,
};

declare global {
  interface Window {
    ChatPanel?: typeof globalApi;
    __ncMapRegistry__?: Record<string, unknown>;
  }
}

window.ChatPanel = globalApi;

function shouldAutoInit(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.currentScript as HTMLScriptElement | null;
  if (el?.getAttribute('data-auto-init') === 'false') return false;
  return true;
}

if (shouldAutoInit()) {
  const run = () => initChatPanel({});
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
}
