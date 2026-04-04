import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh } from "three";

function SpinningDymaxion() {
  const meshRef = useRef<Mesh>(null!);

  useFrame(() => {
    meshRef.current.rotation.y += 0.003;
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <icosahedronGeometry args={[2, 0]} />
      <meshStandardMaterial
        color={"#88aaff"}
        roughness={0.8}
        metalness={0.0}
      />
    </mesh>
  );
}

export default function DymaxionGlobe() {
  return (
    <Canvas shadows camera={{ position: [4, 3, 6], fov: 40 }}>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
      />
      <SpinningDymaxion />
    </Canvas>
  );
}
