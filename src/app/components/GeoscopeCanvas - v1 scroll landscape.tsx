'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

function StarfieldSphere() {
  const texture = useTexture('/stars.jpg');

  // Seamless horizontal wrapping on the GPU
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return (
    <mesh>
      <sphereGeometry args={[500, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function SceneContent() {
  const [controlsEnabled, setControlsEnabled] = useState(false);
  const isDragging = useRef(false);

  useEffect(() => {
    const handlePointerUp = () => {
      isDragging.current = false;
      setControlsEnabled(false);
    };
    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, []);

  useFrame(({ camera, size }) => {
    const perspectiveCam = camera as THREE.PerspectiveCamera;
    perspectiveCam.setViewOffset(
      size.width,
      size.height,
      0,
      window.scrollY - size.height,
      size.width,
      size.height
    );
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />

      <StarfieldSphere />

      <mesh
        position={[0, 0, 0]}
        onPointerEnter={() => setControlsEnabled(true)}
        onPointerLeave={() => {
          if (!isDragging.current) setControlsEnabled(false);
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          isDragging.current = true;
          setControlsEnabled(true);
        }}
      >
        <icosahedronGeometry args={[2, 0]} />
        <meshStandardMaterial color="#3b82f6" flatShading />
      </mesh>

      <OrbitControls makeDefault enableZoom={false} enabled={controlsEnabled} />
    </>
  );
}

export default function GeoscopeCanvas() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
        <SceneContent />
      </Canvas>
    </div>
  );
}