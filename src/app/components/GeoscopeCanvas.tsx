'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

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

// ============================================================
// SCENE CONTENT
// ============================================================
function SceneContent() {
  const { camera, size } = useThree();
  const starsGroupRef = useRef<THREE.Group>(null!);
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0, rotX: 0, rotY: 0 });

  // Precompute layer offsets with jitter so stacked shells don't align into
  // visible "bands" or repeating patterns.
  const layerOffsets = useMemo(() => {
    const offsets: [number, number, number][] = [];
    for (let i = 0; i < LAYER_COUNT; i++) {
      // Bias the whole stack downward so its dense middle sits at the middle of
      // the page, not on the globe (which is now at the top).
      const STAR_FIELD_Y_BIAS = -3500;
      const y = (i - (LAYER_COUNT - 1) / 2) * LAYER_SPACING + STAR_FIELD_Y_BIAS;
      const jx = (Math.random() - 0.5) * LAYER_SPACING * 0.6;
      const jy = (Math.random() - 0.5) * LAYER_SPACING * 0.3;
      const jz = (Math.random() - 0.5) * LAYER_SPACING * 0.6;
      offsets.push([jx, y + jy, jz]);
    }
    return offsets;
  }, []);

  // ----------------------------------------------------------
  // DRAG-ON-GLOBE GATE
  // The real globe lives in a sibling canvas that sits on top of this one,
  // so clicks on it never reach us. Listen on window instead, and only
  // start orbiting the stars when the pointer goes down inside the DOM
  // rect tagged [data-globe-hit].
  // ----------------------------------------------------------
  useEffect(() => {
    const isInsideGlobe = (x: number, y: number) => {
      const hit = document.querySelector('[data-globe-hit]') as HTMLElement | null;
      if (!hit) return false;
      // Flat map: stars hold still. Only drag-orbit while it's still a sphere.
      if (hit.hasAttribute('data-globe-flat')) return false;
      const r = hit.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };

    const onDown = (e: PointerEvent) => {
      if (!isInsideGlobe(e.clientX, e.clientY)) return;
      dragRef.current.active = true;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
    };

    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.active) return;
      const dx = e.clientX - d.lastX;
      const dy = e.clientY - d.lastY;
      d.lastX = e.clientX;
      d.lastY = e.clientY;
      d.rotY += dx * 0.005;
      d.rotX += dy * 0.005;
    };

    const onUp = () => { dragRef.current.active = false; };

    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, []);

  // ----------------------------------------------------------
  // SCROLL-DRIVEN VIEW OFFSET + STAR ROTATION
  // ----------------------------------------------------------
  useFrame(() => {
    const perspectiveCam = camera as THREE.PerspectiveCamera;

    // Uncomment the `- size.height` to shift the globe one viewport below
    // the top of the page (the original "below the hero" behavior).
    const scrollOffset = window.scrollY - size.height;

    perspectiveCam.setViewOffset(
      size.width,
      size.height,
      0,
      scrollOffset,
      size.width,
      size.height
    );

    if (starsGroupRef.current) {
      const d = dragRef.current;
      starsGroupRef.current.rotation.y +=
        (d.rotY - starsGroupRef.current.rotation.y) * 0.15;
      starsGroupRef.current.rotation.x +=
        (d.rotX - starsGroupRef.current.rotation.x) * 0.15;
    }
  });

  useEffect(() => {
    const perspectiveCam = camera as THREE.PerspectiveCamera;
    return () => perspectiveCam.clearViewOffset();
  }, [camera]);

  return (
    <>
      {/* ========================================================
          LIGHTING
          ======================================================== */}
      {/* ambientLight: flat, omnidirectional fill. Raise to soften shadows. */}
      <ambientLight intensity={0.2} />

      {/* directionalLight: sun-like source. Position controls shadow direction. */}
      <directionalLight position={[5, 3, 5]} intensity={1.5} />

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
      <group ref={starsGroupRef}>
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
    </>
  );
}

// ============================================================
// CANVAS WRAPPER
// ============================================================
export default function GeoscopeCanvas() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas
        // --------------------------------------------------------
        // CAMERA
        // fov:   field of view in degrees. Lower = less edge stretching.
        // near:  closest render distance (raise to improve depth precision).
        // far:   farthest render distance (raise only if stars get clipped).
        // position: [x, y, z] starting camera position.
        // --------------------------------------------------------
        camera={{
          position: [0, 0, 8],
          fov: 55,
          near: 0.1,
          far: 2000,
        }}

        // --------------------------------------------------------
        // RENDERER (gl)
        // antialias:        smooth jagged edges (slight perf cost).
        // alpha:            transparent background (we use bg-black on wrapper).
        // powerPreference:  'high-performance' asks for the discrete GPU.
        // preserveDrawingBuffer: needed only if you screenshot the canvas.
        // --------------------------------------------------------
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}

        // --------------------------------------------------------
        // PIXEL RATIO (dpr)
        // [1, 2] clamps Retina/high-DPI to max 2x.
        // Raise max to 3 for sharper text, at a perf cost.
        // --------------------------------------------------------
        dpr={[1, 2]}

        // --------------------------------------------------------
        // SHADOWS
        // false = no shadow maps (cheapest, and we have no shadow casters).
        // true / 'soft' = PCFSoftShadowMap.
        // 'basic' | 'percentage' | 'variance' = other shadow algorithms.
        // --------------------------------------------------------
        shadows={false}

        // --------------------------------------------------------
        // FRAMELOOP
        // 'always' = continuous 60fps rendering (default).
        // 'demand' = render only on state change (best for static scenes).
        // 'never'  = manual control via invalidate().
        // We keep 'always' because setViewOffset runs every frame on scroll.
        // --------------------------------------------------------
        frameloop="always"

        // --------------------------------------------------------
        // ADAPTIVE PERFORMANCE
        // min: lowest DPR the system will drop to under load (0–1).
        // max: highest DPR it will climb back to when idle.
        // Only kicks in when performance regresses.
        // --------------------------------------------------------
        performance={{ min: 0.5, max: 1 }}

        // --------------------------------------------------------
        // RESIZE BEHAVIOR
        // scroll:   watch scroll-driven size changes.
        // debounce: { scroll: 50, resize: 0 }
        //   scroll = ms to wait before reacting to scroll resize.
        //   resize = ms to wait before reacting to window resize (0 = immediate).
        // --------------------------------------------------------
        resize={{ scroll: true, debounce: { scroll: 50, resize: 0 } }}

        // --------------------------------------------------------
        // TONE MAPPING
        // flat = true disables ACESFilmic tone mapping.
        // Set to true if your colors look washed out.
        // --------------------------------------------------------
        flat={false}

        // --------------------------------------------------------
        // COLOR MANAGEMENT
        // legacy = false enables THREE.ColorManagement (three r139+).
        // linear = false keeps automatic sRGB conversion on.
        // --------------------------------------------------------
        legacy={false}
        linear={false}

        // --------------------------------------------------------
        // FALLBACK
        // Rendered when WebGL is unavailable.
        // --------------------------------------------------------
        fallback={<div className="text-white p-8">WebGL not supported.</div>}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}