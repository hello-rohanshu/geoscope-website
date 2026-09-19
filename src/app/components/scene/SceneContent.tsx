'use client';

import { useRef, forwardRef, type ComponentProps } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import ScrollCamera from './ScrollCamera';
import StarField from './StarField';
import GlobeR3F, { type GlobeControls, type GlobeR3FProps } from './GlobeR3F';

/**
 * How much of the globe's rotation the star field mirrors each frame.
 * 0 = stars completely static (no parallax). 1 = stars move exactly with
 * the globe (fully "spinning in space" — more immersive, less depth cue).
 * 0.4 reads as parallax: stars lag slightly behind, suggesting distance.
 * Named and pulled out here so it's easy to find and retune (port spec §7).
 */
const STAR_COUPLING = 1;

export type SceneContentProps = Omit<GlobeR3FProps, 'groupRef'>;

/**
 * Composes the unified scene: scroll-locked camera, star field, lighting,
 * and the globe — plus the coupling that makes dragging the globe also
 * turn the stars.
 *
 * Ordering note: ScrollCamera and GlobeR3F both call useFrame; so does the
 * coupling effect below. React commits child effects before parent effects,
 * and siblings commit in JSX order — so mounting this tree registers
 * ScrollCamera's frame callback first, then GlobeR3F's, and only then (as
 * SceneContent's own effect, the parent) this component's coupling
 * callback. That registration order is preserved on every subsequent
 * frame, which is exactly what's needed: the view offset is set, then the
 * globe's rotation is updated for this frame, then the star field reads
 * that just-updated rotation. See port spec §9's "useFrame order" note —
 * this is why ScrollCamera and GlobeR3F must stay in this relative order
 * in the JSX below.
 */
const SceneContent = forwardRef<GlobeControls, SceneContentProps>(function SceneContent(
  globeProps,
  ref
) {
  const globeGroupRef = useRef<THREE.Group>(null);
  const starGroupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!globeGroupRef.current || !starGroupRef.current) return;
    starGroupRef.current.rotation.x = globeGroupRef.current.rotation.x * STAR_COUPLING;
    starGroupRef.current.rotation.y = globeGroupRef.current.rotation.y * STAR_COUPLING;
  });

  return (
    <>
      <ScrollCamera />
      <StarField groupRef={starGroupRef} />

      {/* ========================================================
          LIGHTING (moved here from GlobeR3F per port spec §6 —
          the globe itself has no lights of its own in the unified scene)
          ======================================================== */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />

      <GlobeR3F ref={ref} groupRef={globeGroupRef} {...globeProps} />
    </>
  );
});

SceneContent.displayName = 'SceneContent';

export default SceneContent;
