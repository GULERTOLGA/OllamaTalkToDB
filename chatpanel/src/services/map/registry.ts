let activeMapInstanceName: string | null = null;

export function setActiveMapInstanceName(name: string | null): void {
  activeMapInstanceName = name;
}

export function getActiveMapInstanceName(): string | null {
  return activeMapInstanceName;
}

/** Kayıtlı harita örneği (ör. maplibregl.Map) veya yoksa null. */
export function getRegisteredMap(): unknown | null {
  const name = activeMapInstanceName;
  if (!name || typeof window === 'undefined') return null;
  return window.__ncMapRegistry__?.[name] ?? null;
}

/** Host atanmışsa `window.maplibregl` (MapLibre API); yoksa undefined. */
export function getMaplibre(): unknown {
  return (window as Window & { maplibregl?: unknown }).maplibregl;
}
