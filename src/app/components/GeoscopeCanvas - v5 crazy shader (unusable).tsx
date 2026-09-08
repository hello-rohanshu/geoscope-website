'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/**
 * 1. INFINITE SPACE SHADER
 * A screen-space volumetric raymarching shader that renders deep space.
 * It bypasses the camera projection entirely, preventing edge stretching,
 * and uses modular arithmetic so it literally never runs out.
 */
function InfiniteSpaceBackground() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uScroll: { value: 0 },
    }),
    [size]
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
      materialRef.current.uniforms.uScroll.value = window.scrollY;
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  });

  return (
    <mesh renderOrder={-1} frustumCulled={false}>
      {/* 2x2 Plane fills exactly the screen in NDC space */}
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        depthWrite={false}
        depthTest={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            // Bypasses view and projection matrices to stick exactly to screen bounds
            gl_Position = vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec2 uResolution;
          uniform float uScroll;
          varying vec2 vUv;

          #define iterations 14
          #define formuparam 0.53
          #define volsteps 15
          #define stepsize 0.12
          #define zoom 0.800
          #define tile 0.850
          #define speed 0.005
          #define brightness 0.0015
          #define darkmatter 0.300
          #define distfading 0.730
          #define saturation 0.850

          void main() {
            vec2 uv = vUv - 0.5;
            // Correct aspect ratio so stars remain perfectly round
            uv.y *= uResolution.y / uResolution.x;
            vec3 dir = vec3(uv * zoom, 1.0);

            // Linear scroll mapped to infinite procedural parallax
            // Tweak the 0.0003 multiplier to adjust how fast the background scrolls
            float scroll = uScroll * 0.0003;
            dir.y -= scroll;

            float time = uTime * speed + 0.25;

            // Base camera origin for the raymarcher
            vec3 from = vec3(1.0, 0.5, 0.5);
            from += vec3(time * 1.5, time, -2.0);

            // Volumetric rendering logic
            float s = 0.1, fade = 1.0;
            vec3 v = vec3(0.0);
            for (int r = 0; r < volsteps; r++) {
              vec3 p = from + s * dir * 0.5;
              p = abs(vec3(tile) - mod(p, vec3(tile * 2.0))); // The modular wrap creates infinity
              float pa, a = pa = 0.0;
              for (int i = 0; i < iterations; i++) {
                p = abs(p) / dot(p, p) - formuparam;
                a += abs(length(p) - pa);
                pa = length(p);
              }
              float dm = max(0.0, darkmatter - a * a * 0.001);
              a *= a * a; 
              if (r > 6) fade *= 1.0 - (1.0 - distfading);
              v += fade;
              v += vec3(s, s * s, s * s * s * s) * a * brightness * fade;
              fade *= distfading;
              s += stepsize;
            }
            v = mix(vec3(length(v)), v, saturation);
            gl_FragColor = vec4(v * 0.01, 1.0);
          }
        `}
      />
    </mesh>
  );
}

/**
 * 2. MAIN SCENE CONTENT
 */
function SceneContent() {
  const orbitRef = useRef<any>(null);
  
  // The initial Z-distance of the camera based on your Canvas setup
  const initialZ = 8; 

  useFrame(({ camera, size }) => {
    const perspectiveCam = camera as THREE.PerspectiveCamera;
    
    // Leaving your original offset logic intact
    const scrollOffset = window.scrollY - size.height;

    // Calculate exact 3D displacement instead of frustum offset
    const vFov = perspectiveCam.fov * (Math.PI / 180);
    const visibleHeight = 2 * Math.tan(vFov / 2) * initialZ;

    // Convert pixel scroll into perfect 1:1 3D world units
    const unitOffset = (scrollOffset / size.height) * visibleHeight;

    // Physically move the camera to map the scroll
    perspectiveCam.position.y = -unitOffset;

    // Sync OrbitControls target so manual user rotation pivots properly
    if (orbitRef.current) {
      orbitRef.current.target.y = -unitOffset;
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />

      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[2, 0]} />
        <meshStandardMaterial color="#3b82f6" flatShading />
      </mesh>

      <OrbitControls
        ref={orbitRef}
        makeDefault
        enableZoom={false}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  );
}

/**
 * 3. CANVAS CONTAINER
 */
export default function GeoscopeCanvas() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas camera={{ position: [0, 0, 8], fov: 55 }}>
        <InfiniteSpaceBackground />
        <SceneContent />
      </Canvas>
    </div>
  );
}