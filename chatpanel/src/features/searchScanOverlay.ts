const SEARCH_SCAN_STYLE_ID = 'nc_search_scan_styles';
const SEARCH_SCAN_OVERLAY_ID = 'nc_search_scan_overlay';

let searchScanOverlayDepth = 0;
let searchScanOverlayEl: HTMLElement | null = null;

function ensureSearchScanGlobalStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(SEARCH_SCAN_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = SEARCH_SCAN_STYLE_ID;
  style.textContent = `
    .nc_search_scan_overlay {
      position: fixed;
      inset: 0;
      z-index: 99950;
      pointer-events: auto;
      overflow: hidden;
      opacity: 1;
      transition: opacity 0.38s ease;
    }
    .nc_search_scan_overlay.nc_search_scan_overlay--exit {
      opacity: 0;
      pointer-events: none;
    }
    .nc_search_scan_layer {
      position: absolute;
      inset: 0;
      clip-path: inset(0 0 100% 0);
      background: rgba(15, 23, 42, 0.14);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      animation: nc_search_scan_reveal 0.88s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    .nc_search_scan_beam {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: min(28vh, 220px);
      pointer-events: none;
      background: linear-gradient(
        180deg,
        transparent 0%,
        rgba(255, 255, 255, 0.14) 45%,
        rgba(96, 165, 250, 0.12) 50%,
        rgba(255, 255, 255, 0.1) 55%,
        transparent 100%
      );
      opacity: 0;
      filter: blur(1px);
      animation: nc_search_scan_beam_move 2.4s ease-in-out infinite;
      animation-delay: 0.75s;
    }
    @keyframes nc_search_scan_reveal {
      to {
        clip-path: inset(0 0 0 0);
      }
    }
    @keyframes nc_search_scan_beam_move {
      0% {
        transform: translateY(-100%);
        opacity: 0;
      }
      8% {
        opacity: 0.85;
      }
      92% {
        opacity: 0.75;
      }
      100% {
        transform: translateY(calc(100vh + 100%));
        opacity: 0;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .nc_search_scan_layer {
        animation-duration: 0.01ms;
        clip-path: inset(0 0 0 0);
      }
      .nc_search_scan_beam {
        animation: none;
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

/** Tam ekran üstten alta bulanık tarama katmanı (harita/host sayfa). */
export function showSearchScanOverlay(): void {
  if (typeof document === 'undefined') return;
  ensureSearchScanGlobalStyles();
  searchScanOverlayDepth += 1;
  if (searchScanOverlayDepth > 1) return;

  const existing = document.getElementById(SEARCH_SCAN_OVERLAY_ID);
  if (existing) {
    searchScanOverlayEl = existing;
    existing.classList.remove('nc_search_scan_overlay--exit');
    existing.style.opacity = '1';
    return;
  }

  const root = document.createElement('div');
  root.id = SEARCH_SCAN_OVERLAY_ID;
  root.className = 'nc_search_scan_overlay';
  root.setAttribute('aria-hidden', 'true');

  const layer = document.createElement('div');
  layer.className = 'nc_search_scan_layer';

  const beam = document.createElement('div');
  beam.className = 'nc_search_scan_beam';

  root.appendChild(layer);
  root.appendChild(beam);
  document.body.appendChild(root);
  searchScanOverlayEl = root;
}

export function hideSearchScanOverlay(): void {
  if (typeof document === 'undefined') return;
  searchScanOverlayDepth = Math.max(0, searchScanOverlayDepth - 1);
  if (searchScanOverlayDepth > 0) return;

  const el = searchScanOverlayEl ?? document.getElementById(SEARCH_SCAN_OVERLAY_ID);
  if (!el) {
    searchScanOverlayEl = null;
    return;
  }

  el.classList.add('nc_search_scan_overlay--exit');
  window.setTimeout(() => {
    el.remove();
    if (searchScanOverlayEl === el) searchScanOverlayEl = null;
  }, 420);
}
