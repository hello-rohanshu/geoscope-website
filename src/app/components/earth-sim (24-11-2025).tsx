'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'

// -------------------- Helper: GMST --------------------
function getGMSTRadians(date: Date) {
  const JD = date.getTime() / 86400000 + 2440587.5
  const D = JD - 2451545.0
  const GMST = 280.46061837 + 360.98564736629 * D
  return (GMST % 360) * (Math.PI / 180)
}

// -------------------- Earth --------------------
function Earth() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const cloudRef = useRef<THREE.Mesh>(null!)

  const dayTexture = useMemo(() => new THREE.TextureLoader().load('/earth_day.jpg'), [])
  const nightTexture = useMemo(() => new THREE.TextureLoader().load('/earth_day.jpg'), [])
  const cloudTexture = useMemo(() => new THREE.TextureLoader().load('/earth_clouds.jpg'), [])

  const uniforms = useMemo(() => ({
    dayTexture: { value: dayTexture },
    nightTexture: { value: nightTexture },
    sunDirection: { value: new THREE.Vector3() },
  }), [dayTexture, nightTexture])

  const longitudeOffset = 77 * (Math.PI / 180)

  useFrame(() => {
    if (!meshRef.current || !cloudRef.current) return
    const now = new Date()
    const gmst = getGMSTRadians(now)
    meshRef.current.rotation.y = -gmst + longitudeOffset
    cloudRef.current.rotation.y = -gmst * 1.02 + longitudeOffset
    uniforms.sunDirection.value.set(-Math.sin(gmst), 0, Math.cos(gmst)).normalize()
  })

  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </mesh>
      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.005, 64, 64]} />
        <meshPhongMaterial
          map={cloudTexture}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}

// -------------------- Stars --------------------
function StarSphere() {
  const starsTexture = useMemo(() => new THREE.TextureLoader().load('/stars.jpg'), [])
  const { camera } = useThree()
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame(() => {
    if (meshRef.current) {
      // Keep the stars at the camera position
      meshRef.current.position.copy(camera.position)
      // Optional: rotate slowly for motion
      meshRef.current.rotation.y += 0.0005
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[50, 64, 64]} />
      <meshBasicMaterial map={starsTexture} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  )
}


// -------------------- Shaders --------------------
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
    vec2 correctedUv = vec2(mod(vUv.x + 0.5, 1.0), vUv.y);
    float lightness = dot(normalize(vWorldNormal), normalize(sunDirection));
    float blend = smoothstep(-0.1, 0.1, lightness);
    vec4 dayColor = texture2D(dayTexture, correctedUv);
    vec4 nightColor = texture2D(nightTexture, correctedUv);
    gl_FragColor = mix(nightColor, dayColor, blend);
  }
`

// -------------------- OrbitControls wrapper --------------------
function CenterZoomControls() {
  const controlsRef = useRef<any>(null)
  const { gl } = useThree()

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    const canvas = gl.domElement

    const onWheel = (event: WheelEvent) => {
      // Block zoom if over portal cards
      const el = document.elementFromPoint(event.clientX, event.clientY)
      if (el && el.closest('.portal-card-wrapper')) {
        event.preventDefault()
        return
      }
      // Otherwise, let OrbitControls handle zoom
    }

    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [gl])

  return <OrbitControls ref={controlsRef} enableZoom={false} enablePan={false} />
}

// -------------------- Main Component --------------------
export default function EarthSim() {
  return (
    <Canvas className="w-full h-full" camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
      <StarSphere />
      <Earth />
      <CenterZoomControls />
    </Canvas>
  )
}
