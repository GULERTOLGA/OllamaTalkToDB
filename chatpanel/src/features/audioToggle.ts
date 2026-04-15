import { setAudioFeatureEnabled } from './audioPlayback';

const NC_CHATPANEL_AUDIO_ENABLED_KEY = 'nc_chatpanel_audio_enabled_v1';

function readStoredAudioEnabled(): boolean {
  if (typeof localStorage === 'undefined') return true;
  try {
    const raw = localStorage.getItem(NC_CHATPANEL_AUDIO_ENABLED_KEY);
    if (raw === null) return true;
    return raw !== '0';
  } catch {
    return true;
  }
}

function writeStoredAudioEnabled(enabled: boolean): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(NC_CHATPANEL_AUDIO_ENABLED_KEY, enabled ? '1' : '0');
  } catch {
    /* storage yok / quota */
  }
}

let audioEnabledState = readStoredAudioEnabled();

export function isChatpanelAudioEnabled(): boolean {
  return audioEnabledState;
}

function setToggleUi(btn: HTMLButtonElement, enabled: boolean): void {
  btn.classList.toggle('btn-success', enabled);
  btn.classList.toggle('btn-outline-light', !enabled);
  btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  btn.title = enabled ? 'Sesli okuma açık' : 'Sesli okuma kapalı';
  btn.textContent = enabled ? 'Seslendirme: Açık' : 'Seslendirme: Kapalı';
}

function emitAudioToggleChanged(enabled: boolean): void {
  window.dispatchEvent(
    new CustomEvent('nc-chatpanel-audio-toggle', {
      detail: { enabled },
    }),
  );
}

export function bindAudioToggleButton(scope: ParentNode): void {
  const btn = scope.querySelector<HTMLButtonElement>('#nc_chatpanel_audio_toggle_btn');
  if (!btn) return;
  if (btn.dataset.ncBoundAudioToggle === 'true') return;
  btn.dataset.ncBoundAudioToggle = 'true';

  setToggleUi(btn, audioEnabledState);
  setAudioFeatureEnabled(audioEnabledState);
  emitAudioToggleChanged(audioEnabledState);
  btn.addEventListener('click', () => {
    audioEnabledState = !audioEnabledState;
    writeStoredAudioEnabled(audioEnabledState);
    setToggleUi(btn, audioEnabledState);
    setAudioFeatureEnabled(audioEnabledState);
    emitAudioToggleChanged(audioEnabledState);
  });
}
