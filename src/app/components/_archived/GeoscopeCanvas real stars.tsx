'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

function StarfieldSphere() {
  const texture = useTexture('/stars.jpg');

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 6);

  return (
    <mesh>
      <sphereGeometry args={[500, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function SceneContent() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { camera, size, raycaster, gl } = useThree();

  useEffect(() => {
    const domEl = gl.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      const rect = domEl.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.intersectObject(meshRef.current);

      if (intersects.length === 0) {
        e.stopImmediatePropagation();
      }
    };

    domEl.addEventListener('pointerdown', handlePointerDown, { capture: true });
    return () => domEl.removeEventListener('pointerdown', handlePointerDown, { capture: true });
  }, [camera, gl, raycaster]);

  useFrame(() => {
    const perspectiveCam = camera as THREE.PerspectiveCamera;

    const scrollOffset = window.scrollY; // - size.height to move it one step below and multiply by x to move x steps below

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

      <StarfieldSphere />

      <mesh ref={meshRef} position={[0, 0, 0]}>
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
      <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
        <SceneContent />
      </Canvas>
    </div>
  );
}