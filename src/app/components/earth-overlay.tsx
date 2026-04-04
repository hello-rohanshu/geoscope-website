'use client'
import React from 'react'

interface EarthOverlayProps {
  rotationSpeed?: number // km/h
  orbitalSpeed?: number  // km/h
  galacticSpeed?: number // km/h
  earthAge?: string
  tilt?: number // axial tilt in degrees
  distanceToSol?: number // million km
  distanceTraveledThisYear?: number // million km
  surfaceGravity?: number // m/s²
  equatorialRadius?: number // km
  polarRadius?: number // km
}

export default function EarthOverlay({
  rotationSpeed = 1670,
  orbitalSpeed = 107000,
  galacticSpeed = 828000,
  earthAge = '4.543 billion years',
  tilt = 23.5,
  distanceToSol = 149.6,
  distanceTraveledThisYear = 537, // rough estimate
  surfaceGravity = 9.807,
  equatorialRadius = 6378,
  polarRadius = 6357,
}: EarthOverlayProps) {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col items-start justify-start">

      {/* Title */}
      <div className="absolute top-1/8 left-1/14 text-6xl font-manrope font-extrabold text-white drop-shadow-lg">
        Spaceship Earth
      </div>

      {/* Metrics panel */}
      <div className="absolute top-[calc(20%+4rem)] left-1/14 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/50 scrollbar-track-black/20 flex flex-col gap-4 p-2">

        {/* Group 1: Age */}
        <div className="flex flex-col gap-1">
          <div className="text-white font-manrope text-lg">{earthAge} old</div>
        </div>

        {/* Group 2: Motion */}
        <div className="flex flex-col gap-1">
          <div className="text-white font-manrope text-lg">Rotating at {rotationSpeed.toLocaleString()} km/h</div>
          <div className="text-white font-manrope text-lg">Orbiting Sol at {orbitalSpeed.toLocaleString()} km/h</div>
          <div className="text-white font-manrope text-lg">Moving through galaxy at {galacticSpeed.toLocaleString()} km/h</div>
        </div>

        {/* Group 3: Orientation / Position */}
        <div className="flex flex-col gap-1">
          <div className="text-white font-manrope text-lg">Axial Tilt: {tilt}°</div>
          <div className="text-white font-manrope text-lg">Distance to Sol: {distanceToSol} million km</div>
          <div className="text-white font-manrope text-lg">Distance traveled this year: {distanceTraveledThisYear} million km</div>
        </div>

        {/* Group 4: Physical dimensions */}
        <div className="flex flex-col gap-1">
          <div className="text-white font-manrope text-lg">Equatorial radius: {equatorialRadius} km</div>
          <div className="text-white font-manrope text-lg">Polar radius: {polarRadius} km</div>
          <div className="text-white font-manrope text-lg">Surface gravity: {surfaceGravity} m/s²</div>
        </div>

        <div className="text-white font-manrope mt-2 italic text-sm">Sol – our Mothership</div>
      </div>
    </div>
  )
}
