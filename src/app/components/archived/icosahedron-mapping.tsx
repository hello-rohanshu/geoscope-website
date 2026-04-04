
// 3D Icosa

"use client"

import { Canvas, useLoader } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { TextureLoader } from "three"

export default function DymaxionUnfold() {
  const texture = useLoader(TextureLoader, "/dymaxion_map.jpg")

  return (
    <Canvas
      style={{ width: "100vw", height: "100vh", background: "black" }}
      camera={{ position: [0, 0, 5], fov: 50 }}
    >
      {/* Icosahedron with Dymaxion texture */}
      <mesh>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial map={texture} />
      </mesh>

      {/* Axes helper for orientation */}
      <primitive object={new THREE.AxesHelper(2)} />

      {/* Controls */}
      <OrbitControls />
    </Canvas>
  )
}
