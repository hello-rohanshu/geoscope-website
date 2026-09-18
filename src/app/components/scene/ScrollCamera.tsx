'use client';

import { useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Keeps the star field visually pinned in place while the page scrolls, by
 * shifting the camera's view WINDOW (not its actual position/rotation) by
 * window.scrollY every frame — `setViewOffset` renders a sub-rectangle of
 * the camera's full frustum, so the scene appears to slide past a moving
 * window instead of the camera itself moving.
 *
 * Ported verbatim from GeoscopeCanvas.tsx's SceneContent. This is the
 * "scroll does not move stars" half of the UX contract (port spec §4.1) —
 * the other half, "drag moves stars," lives in SceneContent's star/globe
 * rotation coupling.
 *
 * Registration order matters: this must mount (and therefore subscribe to
 * useFrame) before GlobeR3F, so the view offset for a frame is set before
 * that frame renders. See the "useFrame order" gotcha in port spec §9 —
 * SceneContent places this first in its JSX to guarantee that.
 */
export default function ScrollCamera() {
  const { camera, size } = useThree();

  useFrame(() => {
    const perspectiveCam = camera as THREE.PerspectiveCamera;

    // Uncomment the `- size.height` to shift the globe one viewport below
    // the top of the page (the original "below the hero" behavior) —
    // preserved as a comment from the source file in case it's wanted again.
    const scrollOffset = window.scrollY /* - size.height */;

    perspectiveCam.setViewOffset(
      size.width,
      size.height,
      0,
      scrollOffset,
      size.width,
      size.height
    );
  });

  useEffect(() => {
    const perspectiveCam = camera as THREE.PerspectiveCamera;
    return () => perspectiveCam.clearViewOffset();
  }, [camera]);

  return null;
}
