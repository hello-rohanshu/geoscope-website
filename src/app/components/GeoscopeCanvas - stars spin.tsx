'use client';

import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

function StarfieldSphere() {
  const texture = useTexture('/stars.jpg');

  return (
    <mesh>
      <sphereGeometry args={[500, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function SceneContent() {
  const shapeRef = useRef<THREE.Group>(null);
  const starsRef = useRef<THREE.Group>(null);
  const scrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame(({ camera, viewport }) => {
    if (!shapeRef.current || !starsRef.current) return;

    const scrollRatio = scrollRef.current / window.innerHeight;
    const targetY = scrollRatio * viewport.height;

    // 1. Move Icosahedron aligned with camera viewport
    const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
    const planetPosition = cameraUp.multiplyScalar(targetY);
    shapeRef.current.position.lerp(planetPosition, 0.1);

    // 2. Keep sphere centered on camera so it NEVER clips or runs out
    starsRef.current.position.copy(camera.position);

    // 3. Convert scroll ratio to camera FOV angle for 1:1 visual scroll speed
    const perspectiveCam = camera as THREE.PerspectiveCamera;
    const fovRad = THREE.MathUtils.degToRad(perspectiveCam.fov || 75);
    const targetPitch = -scrollRatio * fovRad;

    // Apply pitch rotation aligned with camera orientation
    const pitchQuat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      targetPitch
    );
    const targetStarQuat = camera.quaternion.clone().multiply(pitchQuat);
    starsRef.current.quaternion.slerp(targetStarQuat, 0.1);
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />

      <group ref={starsRef}>
        <StarfieldSphere />
      </group>

      <group ref={shapeRef}>
        <mesh>
          <icosahedronGeometry args={[2, 0]} />
          <meshStandardMaterial color="#3b82f6" flatShading />
        </mesh>
      </group>
    </>
  );
}

export default function GeoscopeCanvas() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
        <SceneContent />
        <OrbitControls makeDefault enableZoom={false} />
      </Canvas>
    </div>
  );
}