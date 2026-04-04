'use client';

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

export const EarthSim = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the Cesium Viewer
    viewerRef.current = new Cesium.Viewer(containerRef.current, {
      imageryProviderViewModels: [],
      selectedImageryProviderViewModel: undefined,
      terrainProviderViewModels: [],
      selectedTerrainProviderViewModel: undefined,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
    });

    const viewer = viewerRef.current;

    // Enable dynamic lighting for day/night terminator
    viewer.scene.globe.enableLighting = true;

    // Center camera on Earth
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(0.0, 0.0, 5000000.0),
    });

    // Optional: Reduce rendering for performance (good for background)
    viewer.scene.requestRenderMode = true;
    viewer.scene.maximumRenderTimeChange = Infinity;

    // Cleanup on unmount
    return () => {
      if (viewer) {
        viewer.destroy();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1, // So it can be used as background
      }}
    />
  );
};
