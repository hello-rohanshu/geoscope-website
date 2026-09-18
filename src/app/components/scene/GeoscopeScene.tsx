'use client';

import { forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import SceneContent, { type SceneContentProps } from './SceneContent';
import type { GlobeControls } from './GlobeR3F';

export type GeoscopeSceneProps = SceneContentProps;

/**
 * Fixed full-screen R3F Canvas — the site's background. One renderer, one
 * scene, one camera, hosting both the star field and the globe so drag on
 * the globe and scroll on the page can share camera/group state (port
 * spec §1, §3). Canvas props below are copied from GeoscopeCanvas.tsx's
 * <Canvas> exactly, per spec §6.
 *
 * Note on the camera: the raw-Three globe used to run its own camera at
 * fov 42 / near 0.01 / far 100. That's gone now — there's one shared
 * camera, and it has to serve the star field too (which needs far ≥ ~620
 * to reach the outermost star shell, and was tuned assuming fov 55 — see
 * the "at fov 55" coverage comment in StarField.tsx). So the globe now
 * renders at fov 55 instead of 42, a bit more wide-angle than before. The
 * render loop's own camera-Z easing (SPHERE_Z/FLAT_Z in GlobeR3F) is
 * unchanged, so framing distance is still correct — only the field of
 * view itself is slightly wider. Worth an eyeball pass once this is
 * running; if the globe reads as too fisheye-y at the edges, that's the
 * number to adjust (either back down on this fov, at some cost to star
 * coverage math, or by tightening SPHERE_Z/FLAT_Z to compensate).
 */
const GeoscopeScene = forwardRef<GlobeControls, GeoscopeSceneProps>(function GeoscopeScene(
  props,
  ref
) {
  return (
    <div className="fixed inset-0 z-0 bg-black" data-lenis-prevent>
      <Canvas
        camera={{
          position: [0, 0, 8],
          fov: 55,
          near: 0.1,
          far: 2000,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        shadows={false}
        frameloop="always"
        performance={{ min: 0.5, max: 1 }}
        resize={{ scroll: true, debounce: { scroll: 50, resize: 0 } }}
        flat={false}
        legacy={false}
        linear={false}
        fallback={<div className="text-white p-8">WebGL not supported.</div>}
      >
        <SceneContent ref={ref} {...props} />
      </Canvas>
    </div>
  );
});

GeoscopeScene.displayName = 'GeoscopeScene';

export default GeoscopeScene;
