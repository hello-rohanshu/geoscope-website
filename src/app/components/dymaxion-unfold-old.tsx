'use client';

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { useMemo, useState } from "react"

function OneFlap() {
  const [angle, setAngle] = useState(0)

  const { face1, face2, sharedEdge, normal1 } = useMemo(() => {
    const geom = new THREE.IcosahedronGeometry(1, 0).toNonIndexed()
    const posAttr = geom.getAttribute("position") as THREE.BufferAttribute
    const positions = posAttr.array as Float32Array

    // First two triangles
    const v1 = new THREE.Vector3(positions[0], positions[1], positions[2])
    const v2 = new THREE.Vector3(positions[3], positions[4], positions[5])
    const v3 = new THREE.Vector3(positions[6], positions[7], positions[8])

    const v4 = new THREE.Vector3(positions[9], positions[10], positions[11])
    const v5 = new THREE.Vector3(positions[12], positions[13], positions[14])
    const v6 = new THREE.Vector3(positions[15], positions[16], positions[17])

    const face1 = [v1, v2, v3]
    const face2 = [v4, v5, v6]

    // Shared edge? (hack for demo: pick v2–v3 as hinge)
    const sharedEdge = [v2, v3]

    // Normal for reference
    const normal1 = new THREE.Vector3()
      .crossVectors(new THREE.Vector3().subVectors(v2, v1), new THREE.Vector3().subVectors(v3, v1))
      .normalize()

    return { face1, face2, sharedEdge, normal1 }
  }, [])

  return (
    <group>
      {/* Base triangle */}
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(face1.flatMap(v => v.toArray())), 3]}
          />
        </bufferGeometry>
        <meshBasicMaterial color="red" side={THREE.DoubleSide} />
      </mesh>

      {/* Hinged triangle */}
      <group
        position={sharedEdge[0].toArray()}
        onClick={() => setAngle(a => a + Math.PI / 6)}
      >
        <mesh rotation={[0, 0, angle]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(face2.map(v => v.clone().sub(sharedEdge[0]).toArray()).flat()), 3]}
            />
          </bufferGeometry>
          <meshBasicMaterial color="orange" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  )
}

export default function DymaxionTest() {
  return (
    <Canvas style={{ width: "100vw", height: "100vh", background: "black" }} camera={{ position: [0, 0, 5] }}>
      <OneFlap />
      <OrbitControls />
    </Canvas>
  )
}
