

// henged triangles



"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { useMemo } from "react"

function IcosahedronFaces() {
  const faces = useMemo(() => {
    const geom = new THREE.IcosahedronGeometry(1, 0)
    const posAttr = geom.getAttribute("position") as THREE.BufferAttribute
    const positions = posAttr.array as Float32Array
    const indexAttr = geom.index

    // Handle missing indices
    const indices = indexAttr ? indexAttr.array : Array.from({ length: positions.length / 3 }, (_, i) => i)

    const result: { vertices: [number, number, number][], color: string }[] = []

    for (let i = 0; i < indices.length; i += 3) {
      const v1 = [positions[indices[i] * 3], positions[indices[i] * 3 + 1], positions[indices[i] * 3 + 2]]
      const v2 = [positions[indices[i + 1] * 3], positions[indices[i + 1] * 3 + 1], positions[indices[i + 1] * 3 + 2]]
      const v3 = [positions[indices[i + 2] * 3], positions[indices[i + 2] * 3 + 1], positions[indices[i + 2] * 3 + 2]]

      const color = `hsl(${(i * 30) % 360}, 70%, 50%)`
      result.push({ vertices: [v1, v2, v3] as [number, number, number][], color })
    }
    return result
  }, [])

  return (
    <>
      {faces.map((face, i) => {
        const flatVerts = new Float32Array(face.vertices.flat())

        return (
          <group key={i}>
            {/* Solid face */}
            <mesh>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[flatVerts, 3]} />
              </bufferGeometry>
              <meshBasicMaterial color={face.color} side={THREE.DoubleSide} />
            </mesh>

            {/* Wireframe outline */}
            <lineSegments>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[
                    new Float32Array([
                      ...face.vertices[0], ...face.vertices[1],
                      ...face.vertices[1], ...face.vertices[2],
                      ...face.vertices[2], ...face.vertices[0],
                    ]),
                    3,
                  ]}
                />
              </bufferGeometry>
              <lineBasicMaterial color="white" linewidth={1} />
            </lineSegments>
          </group>
        )
      })}
    </>
  )
}

export default function DymaxionUnfold() {
  return (
    <Canvas
      style={{ width: "100vw", height: "100vh", background: "black" }}
      camera={{ position: [0, 0, 5], fov: 50 }}
    >
      <IcosahedronFaces />
      <OrbitControls />
    </Canvas>
  )
}
