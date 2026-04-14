type AudioTrackBarBinding = {
  root: HTMLElement;
  fill: HTMLElement;
  stopBtn: HTMLButtonElement;
};

const bindings: AudioTrackBarBinding[] = [];
let audioFeatureEnabled = true;
let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;

function cleanupCurrentAudio(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
    } catch {
      /* */
    }
    currentAudio = null;
  }
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

function renderTrackBars(progress01: number): void {
  for (const b of bindings) {
    b.root.hidden = !audioFeatureEnabled;
    b.stopBtn.disabled = !currentAudio;
    const pct = Math.max(0, Math.min(100, Math.round(progress01 * 100)));
    b.fill.style.width = `${pct}%`;
  }
}

export function stopAudioPlayback(): void {
  cleanupCurrentAudio();
  renderTrackBars(0);
}

export function setAudioFeatureEnabled(enabled: boolean): void {
  audioFeatureEnabled = enabled;
  if (!audioFeatureEnabled) {
    stopAudioPlayback();
    return;
  }
  renderTrackBars(0);
}

export async function playAudioBlob(blob: Blob): Promise<void> {
  if (!audioFeatureEnabled || !blob.size) return;
  stopAudioPlayback();

  const objectUrl = URL.createObjectURL(blob);
  const audio = new Audio(objectUrl);
  audio.preload = 'auto';
  currentAudio = audio;
  currentObjectUrl = objectUrl;

  const onProgress = (): void => {
    const duration = audio.duration;
    const currentTime = audio.currentTime;
    if (!Number.isFinite(duration) || duration <= 0) {
      renderTrackBars(0);
      return;
    }
    renderTrackBars(currentTime / duration);
  };

  const onEnd = (): void => {
    stopAudioPlayback();
  };

  audio.addEventListener('timeupdate', onProgress);
  audio.addEventListener('ended', onEnd, { once: true });
  audio.addEventListener('error', onEnd, { once: true });

  const tryPlay = async (): Promise<void> => {
    await audio.play();
  };

  try {
    await tryPlay();
    return;
  } catch (err) {
    console.warn('[chatpanel] audio autoplay engellendi, sonraki etkileşimde tekrar denenecek', err);
  }

  const retryOnGesture = (): void => {
    void tryPlay().catch((err) => {
      console.error('[chatpanel] audio tekrar oynatma hatası', err);
      stopAudioPlayback();
    });
  };
  window.addEventListener('pointerdown', retryOnGesture, { once: true, passive: true });
}

export function bindAudioTrackBar(scope: ParentNode): void {
  const root = scope.querySelector<HTMLElement>('#nc_chatpanel_audio_trackbar');
  const fill = scope.querySelector<HTMLElement>('#nc_chatpanel_audio_trackbar_fill');
  const stopBtn = scope.querySelector<HTMLButtonElement>('#nc_chatpanel_audio_stop_btn');
  if (!root || !fill || !stopBtn) return;
  if (root.dataset.ncBoundAudioTrackbar === 'true') return;
  root.dataset.ncBoundAudioTrackbar = 'true';

  bindings.push({ root, fill, stopBtn });
  stopBtn.addEventListener('click', () => {
    stopAudioPlayback();
  });
  renderTrackBars(0);
}
