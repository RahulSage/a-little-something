import type { CSSProperties } from 'react';

/** Slow-drifting gradient light, grain and vignette. Pure CSS. */
export function Atmosphere({ birthday, intensity }: { birthday: boolean; intensity: number }) {
  return (
    <div className="atmo" data-birthday={birthday} style={{ '--intensity': intensity } as CSSProperties} aria-hidden="true">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="atmo-warm" />
      <div className="hero-light" />
      <div className="vignette" />
      <div className="grain" />
    </div>
  );
}
