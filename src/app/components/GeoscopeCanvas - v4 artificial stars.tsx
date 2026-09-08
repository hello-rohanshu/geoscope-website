'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

function SceneContent() {
  useFrame(({ camera, size }) => {
    const perspectiveCam = camera as THREE.PerspectiveCamera;

    const scrollOffset = window.scrollY - size.height;

    perspectiveCam.setViewOffset(
      size.width,
      size.height,
      0,
      scrollOffset,
      size.width,
      size.height
    );
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />

      {/* Point-based stars eliminate sphere UV mapping distortion */}
      <Stars
        radius={500}
        depth={50}
        count={1500}    /* Reduced density */
        factor={21}      /* Larger star points stop sub-pixel shimmering */
        saturation={0}
        fade
        speed={0}       /* Set to 0 to stop active flickering */
      />

      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[2, 0]} />
        <meshStandardMaterial color="#3b82f6" flatShading />
      </mesh>

      <OrbitControls
        makeDefault
        enableZoom={false}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  );
}

export default function GeoscopeCanvas() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      {/* FOV reduced to 55 to prevent peripheral edge stretching */}
      <Canvas camera={{ position: [0, 0, 8], fov: 55 }}>
        <SceneContent />
      </Canvas>
    </div>
  );
}