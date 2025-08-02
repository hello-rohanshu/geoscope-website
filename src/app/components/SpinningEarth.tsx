// components/SpinningEarth.tsx
'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, OrbitControls } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const dayTexture = useMemo(() => new THREE.TextureLoader().load('/earth_day.jpg'), [])
  const nightTexture = useMemo(() => new THREE.TextureLoader().load('/earth_night.jpg'), [])
  const cloudTexture = useMemo(() => new THREE.TextureLoader().load('/earth_clouds.jpg'), [])

  const uniforms = useMemo(() => ({
    dayTexture: { value: dayTexture },
    nightTexture: { value: nightTexture },
    sunDirection: { value: new THREE.Vector3() },
  }), [dayTexture, nightTexture])

  useFrame(({ clock }) => {
    if (!meshRef.current) return

    const now = new Date()
    const secondsToday = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds()
    const earthRotationAngle = (secondsToday / 86400) * 2 * Math.PI

    // Rotate Earth by real time
    meshRef.current.rotation.y = earthRotationAngle

    // Sun direction is fixed relative to the scene
    // Sun is at Z+ direction relative to the scene
    uniforms.sunDirection.value.set(0, 0, 1).normalize()
  })

  return (
    <>
      <mesh ref={meshRef} rotation={[0, 0, 0]}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </mesh>

      {/* Cloud Layer */}
      <mesh rotation={[0, 0, 0]}>
        <sphereGeometry args={[1.005, 64, 64]} />
        <meshPhongMaterial
          map={cloudTexture}
          transparent={true}
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const fragmentShader = `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform vec3 sunDirection;

  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    float lightness = dot(normalize(vWorldNormal), normalize(sunDirection));
    float blend = smoothstep(-0.1, 0.1, lightness);
    vec4 dayColor = texture2D(dayTexture, vUv);
    vec4 nightColor = texture2D(nightTexture, vUv);
    gl_FragColor = mix(nightColor, dayColor, blend);
  }
`

export default function SpinningEarth() {
  return (
    <div className="border-8 border-gray-700 rounded-none" style={{ width: '100%', height: '400px' }}>
      <Canvas camera={{ position: [2, 0, 2] }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 3, 5]} intensity={1} />
        <Stars radius={100} depth={50} count={1000} factor={4} fade />
        <Earth />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  )
}
