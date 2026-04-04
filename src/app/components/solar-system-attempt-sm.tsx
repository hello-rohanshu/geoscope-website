'use client'
import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

function EarthMetricsOverlay() {
  const rotationSpeed = 1670 // km/h
  const orbitalSpeed = 107000 // km/h
  const distanceTraveledThisYear = 537 // million km
  const earthAge = '4.543 billion years'

  return (
    <div className="absolute left-1/9 top-1/5 flex flex-col gap-3 p-4 pointer-events-none">
      <div className="text-4xl font-manrope font-extrabold text-white drop-shadow-lg">
        Spaceship Earth
      </div>
      <div className="flex flex-col gap-1 mt-4 text-white font-manrope text-lg">
        <div>{earthAge} old</div>
        <div>Rotating at {rotationSpeed.toLocaleString()} km/h</div>
        <div>Orbiting Sol at {orbitalSpeed.toLocaleString()} km/h</div>
        <div>Distance traveled this year: {distanceTraveledThisYear} million km</div>
      </div>
    </div>
  )
}

function SolarSystem() {
  const earthRef = useRef<THREE.Mesh>(null!)
  const moonRef = useRef<THREE.Mesh>(null!)

  const earthTexture = useMemo(() => new THREE.TextureLoader().load('/earth_day.jpg'), [])
  const moonTexture = useMemo(() => new THREE.TextureLoader().load('/moon.jpg'), [])

  const earthRadius = 1
  const moonRadius = 0.27
  const moonDistance = 5

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime()

    // Keep camera focused on Earth
    camera.lookAt(0, 0, 0)

    // Earth rotation (1 day = 10s demo)
    if (earthRef.current) earthRef.current.rotation.y = (t * (2 * Math.PI)) / 10

    // Moon orbit (1 lunar month = 20s demo)
    if (moonRef.current) {
      const orbitSpeed = (2 * Math.PI) / 20
      moonRef.current.position.set(
        earthRef.current!.position.x + Math.cos(t * orbitSpeed) * moonDistance,
        0,
        earthRef.current!.position.z + Math.sin(t * orbitSpeed) * moonDistance
      )
    }
  })

  return (
    <>
      {/* Earth */}
      <mesh ref={earthRef} position={[0, 0, 0]}>
        <sphereGeometry args={[earthRadius, 64, 64]} />
        <meshPhongMaterial map={earthTexture} />
      </mesh>

      {/* Moon */}
      <mesh ref={moonRef}>
        <sphereGeometry args={[moonRadius, 32, 32]} />
        <meshPhongMaterial map={moonTexture} />
      </mesh>

      {/* Symbolic Sun */}
      <mesh position={[-15, 0, 0]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="yellow" />
      </mesh>

      {/* Sun label for true distance */}
      <Html position={[-15, 3, 0]}>
        <div className="text-yellow-400 font-manrope text-lg">
          Sol (Sun) ~149.6M km away
        </div>
      </Html>

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} />
    </>
  )
}

export default function Solarv1() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <Canvas camera={{ position: [0, 8, 15], fov: 50 }}>
        <SolarSystem />
      </Canvas>
      <EarthMetricsOverlay />
    </div>
  )
}
