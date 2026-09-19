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

  const longitudeOffset = 120 * (Math.PI / 180)

  useFrame(() => {
    if (!meshRef.current || !cloudRef.current) return
    const now = new Date()
    const gmst = getGMSTRadians(now)
    
    // Rotate Earth based on GMST (Earth's actual rotation)
    meshRef.current.rotation.y = gmst + longitudeOffset
    cloudRef.current.rotation.y = gmst * 1.02 + longitudeOffset
    
    // Sun direction is fixed in space (pointing from +X direction)
    // This creates a realistic terminator line as Earth rotates
    uniforms.sunDirection.value.set(1, 0, 0)
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

  return (
    <mesh>
      <sphereGeometry args={[100, 64, 64]} />
      <meshBasicMaterial map={starsTexture} side={THREE.BackSide} />
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
    // Calculate how much light this point receives from the sun
    float lightIntensity = dot(normalize(vWorldNormal), normalize(sunDirection));
    
    // Create smooth transition at terminator line
    // smoothstep creates a gradual blend from night to day
    float blend = smoothstep(-0.15, 0.15, lightIntensity);
    
    vec4 dayColor = texture2D(dayTexture, vUv);
    vec4 nightColor = texture2D(nightTexture, vUv) * 0.3; // Dimmer night side
    
    // Add atmospheric glow at the terminator
    float terminator = 1.0 - abs(lightIntensity);
    terminator = pow(terminator, 8.0) * 0.5;
    vec3 glowColor = vec3(1.0, 0.6, 0.3) * terminator;
    
    vec4 finalColor = mix(nightColor, dayColor, blend);
    finalColor.rgb += glowColor;
    
    gl_FragColor = finalColor;
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
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 0, 0]} intensity={2} />
      <StarSphere />
      <Earth />
      <CenterZoomControls />
    </Canvas>
  )
}