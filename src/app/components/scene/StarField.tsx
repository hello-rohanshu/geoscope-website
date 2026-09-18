'use client';

import { useMemo, type RefObject } from 'react';
import { Stars } from '@react-three/drei';
import type * as THREE from 'three';

// ============================================================
// STAR FIELD CONFIG
// ============================================================
// Each shell covers ~2 viewport heights at fov 55.
// LAYER_COUNT * LAYER_SPACING + 2 * STAR_RADIUS = total world-unit coverage.
const STAR_RADIUS = 500;
const STAR_DEPTH = 120;       // How far stars scatter inward from the shell surface.
const LAYER_COUNT = 17;       // Number of stacked shells (more = taller coverage).
const LAYER_SPACING = 420;    // Vertical gap between shells (smaller = denser overlap).

const TOTAL_STARS = 10000;    // Total points across all layers combined.
const STARS_PER_LAYER = Math.ceil(TOTAL_STARS / LAYER_COUNT);

const STAR_FACTOR = 21;       // Point size multiplier. Raise this to reduce sub-pixel flicker.
const STAR_SATURATION = 0;    // 0 = pure white stars, 1 = fully saturated colors.
const STAR_SPEED = 0;         // 0 = static stars (no twinkle animation).

// Bias the whole stack downward so its dense middle sits at the middle of
// the page, not on the globe (which lives at the top of the page).
const STAR_FIELD_Y_BIAS = -3500;

interface StarFieldProps {
  /**
   * Ref to a <group> wrapping every star layer. SceneContent reads the
   * globe's group rotation each frame and mirrors a fraction of it onto
   * this group, producing the "drag rotates stars too" parallax effect
   * (port spec §7). StarField itself never writes to this ref — it only
   * attaches it to the wrapping group.
   */
  groupRef: RefObject<THREE.Group | null>;
}

export default function StarField({ groupRef }: StarFieldProps) {
  // Precompute layer offsets with jitter so stacked shells don't align into
  // visible "bands" or repeating patterns.
  const layerOffsets = useMemo(() => {
    const offsets: [number, number, number][] = [];
    for (let i = 0; i < LAYER_COUNT; i++) {
      const y = (i - (LAYER_COUNT - 1) / 2) * LAYER_SPACING + STAR_FIELD_Y_BIAS;
      const jx = (Math.random() - 0.5) * LAYER_SPACING * 0.6;
      const jy = (Math.random() - 0.5) * LAYER_SPACING * 0.3;
      const jz = (Math.random() - 0.5) * LAYER_SPACING * 0.6;
      offsets.push([jx, y + jy, jz]);
    }
    return offsets;
  }, []);

  return (
    <group ref={groupRef}>
      {/* ========================================================
          STARS (Drei <Stars>)
          - radius:    distance from center to the star shell.
          - depth:     how far inward stars scatter.
          - count:     number of points per shell.
          - factor:    point size multiplier (raise to reduce flicker).
          - saturation: 0 = white, 1 = colorful.
          - fade:      soften star edges for a more organic look.
          - speed:     0 = static, >0 = twinkle animation.
          ======================================================== */}
      {layerOffsets.map((pos, i) => (
        <group key={i} position={pos}>
          <Stars
            radius={STAR_RADIUS}
            depth={STAR_DEPTH}
            count={STARS_PER_LAYER}
            factor={STAR_FACTOR}
            saturation={STAR_SATURATION}
            fade
            speed={STAR_SPEED}
          />
        </group>
      ))}
    </group>
  );
}
