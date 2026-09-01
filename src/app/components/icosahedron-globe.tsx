import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  SPHERE3D, SPHERE, FLAT, PAL, ease, bezier3, vertexKey, vertexControlMap, computeFaceT, NUM_FACES,
} from '@/utils/icosahedron-geometry';

import {
  PopulationBuffers, PopulationSample, buildPopulationBuffers, updatePopulationPositions, createPopulationPoints,
} from '@/utils/population-layer';

// ──────────────────────────── CONFIGURATION ────────────────────────────
const ANIMATION_SPEED: number = 0.05;
const STAGGER_RATIO: number = 0.0;       // 0 = fully synchronised

interface AnimState {
  t: number;
  tgt: number;
  drag: boolean;
  lastMouse: { x: number; y: number } | null;
  frameId: number;
}

interface IcosahedronGlobeProps {
  width?: number;
  height?: number;
  unfolded?: boolean;
  onToggle?: (unfolded: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  populationSamples?: PopulationSample[];
  showPopulation?: boolean;
  populationColor?: string;
  populationSize?: number;
  populationOpacity?: number;
}

const IcosahedronGlobe: React.FC<IcosahedronGlobeProps> = ({
  width = 680,
  height = 500,
  unfolded = false,
  onToggle,
  className,
  style,
  populationSamples,
  showPopulation = true,
  populationColor,
  populationSize,
  populationOpacity,
  ...canvasProps
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const wiresRef = useRef<THREE.LineSegments[]>([]);
  const animRef = useRef<AnimState>({
    t: 0,
    tgt: unfolded ? 1 : 0,
    drag: false,
    lastMouse: null,
    frameId: 0,
  });

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const populationBuffersRef = useRef<PopulationBuffers | null>(null);
  const populationPointsRef = useRef<THREE.Points | null>(null);

  const toggle = useCallback(() => {
    animRef.current.tgt = animRef.current.tgt === 0 ? 1 : 0;
    onToggle?.(animRef.current.tgt === 1);
  }, [onToggle]);

  const updateGeometry = useCallback((globalT: number) => {
    const meshes = meshesRef.current;
    const wires = wiresRef.current;
    if (!meshes.length) return;

    SPHERE3D.forEach((_, fi: number) => {
      const faceT = computeFaceT(globalT, fi, NUM_FACES, STAGGER_RATIO);
      const et = ease(faceT);

      const vertices: THREE.Vector3[] = [0, 1, 2].map((i: number) => {
        const sphereVert = SPHERE[fi][i];
        const flatVert = FLAT[fi][i];
        const cp = vertexControlMap.get(vertexKey(sphereVert));
        if (!cp) throw new Error('Control point not found');
        return bezier3(sphereVert, flatVert, cp, et);
      });

      const posArray = meshes[fi].geometry.attributes.position.array as Float32Array;
      vertices.forEach((v, i) => {
        posArray[i * 3] = v.x;
        posArray[i * 3 + 1] = v.y;
        posArray[i * 3 + 2] = v.z;
      });
      meshes[fi].geometry.attributes.position.needsUpdate = true;

      const wPosArray = wires[fi].geometry.attributes.position.array as Float32Array;
      vertices.forEach((v, i) => {
        wPosArray[i * 3] = v.x;
        wPosArray[i * 3 + 1] = v.y;
        wPosArray[i * 3 + 2] = v.z;
      });
      wires[fi].geometry.attributes.position.needsUpdate = true;
    });

    const buffers = populationBuffersRef.current;
    const points = populationPointsRef.current;
    if (buffers && points) {
      updatePopulationPositions(buffers, globalT, STAGGER_RATIO, NUM_FACES);
      (points.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }
  }, []);

  // Initialise Three.js once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.01, 100);
    camera.position.set(0, 0, 5.6);
    cameraRef.current = camera;

    const grp = new THREE.Group();
    scene.add(grp);
    groupRef.current = grp;

    const meshes: THREE.Mesh[] = [];
    const wires: THREE.LineSegments[] = [];
    SPHERE3D.forEach((_, fi: number) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3));
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(PAL[fi] || '#8AA0CC'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.88,
      });
      const mesh = new THREE.Mesh(geo, mat);
      grp.add(mesh);
      meshes.push(mesh);

      const wg = new THREE.BufferGeometry();
      wg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3));
      wg.setIndex([0, 1, 1, 2, 2, 0]);
      const wire = new THREE.LineSegments(wg, new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
      }));
      grp.add(wire);
      wires.push(wire);
    });
    meshesRef.current = meshes;
    wiresRef.current = wires;

    updateGeometry(animRef.current.tgt);

    const onMouseDown = (e: MouseEvent) => {
      animRef.current.lastMouse = { x: e.clientX, y: e.clientY };
      animRef.current.drag = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      const { lastMouse } = animRef.current;
      if (!lastMouse) return;
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) animRef.current.drag = true;
      if (animRef.current.drag && groupRef.current) {
        groupRef.current.rotation.y += dx * 0.007;
        groupRef.current.rotation.x += dy * 0.007;
        animRef.current.lastMouse = { x: e.clientX, y: e.clientY };
      }
    };
    const onMouseUp = () => {
      if (!animRef.current.drag) toggle();
      animRef.current.lastMouse = null;
      animRef.current.drag = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);

    return () => {
      cancelAnimationFrame(animRef.current.frameId);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      populationPointsRef.current?.geometry.dispose();
      (populationPointsRef.current?.material as THREE.Material | undefined)?.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, [width, height, toggle, updateGeometry]);

  // Build (or rebuild) the population layer whenever the sample set changes
  useEffect(() => {
    const grp = groupRef.current;
    if (!grp) return;

    if (populationPointsRef.current) {
      grp.remove(populationPointsRef.current);
      populationPointsRef.current.geometry.dispose();
      (populationPointsRef.current.material as THREE.Material).dispose();
      populationPointsRef.current = null;
      populationBuffersRef.current = null;
    }

    if (populationSamples && populationSamples.length > 0) {
      const buffers = buildPopulationBuffers(populationSamples);
      updatePopulationPositions(buffers, animRef.current.t, STAGGER_RATIO, NUM_FACES);
      const points = createPopulationPoints(buffers, {
        color: populationColor,
        size: populationSize,
        opacity: populationOpacity,
      });
      points.visible = showPopulation;
      grp.add(points);
      populationBuffersRef.current = buffers;
      populationPointsRef.current = points;
    }
  }, [populationSamples]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle visibility independently of fold state
  useEffect(() => {
    if (populationPointsRef.current) populationPointsRef.current.visible = showPopulation;
  }, [showPopulation]);

  // Animation loop
  useEffect(() => {
    const loop = (): void => {
      const { t, tgt, drag } = animRef.current;
      if (Math.abs(t - tgt) > 0.0005) {
        const newT = t + (tgt > t ? ANIMATION_SPEED : -ANIMATION_SPEED);
        animRef.current.t = Math.max(0, Math.min(1, newT));
      } else if (t !== tgt) {
        animRef.current.t = tgt;
      }

      updateGeometry(animRef.current.t);

      if (!drag && groupRef.current) {
        if (animRef.current.tgt === 0 && animRef.current.t < 0.05) {
          groupRef.current.rotation.y += 0.004;
        } else if (animRef.current.tgt === 1) {
          const progress = animRef.current.t;
          const damping = 0.02 + progress * 0.06;
          groupRef.current.rotation.x += (-0.04 - groupRef.current.rotation.x) * damping;
          groupRef.current.rotation.y += (0 - groupRef.current.rotation.y) * damping;
        }
      }

      rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
      animRef.current.frameId = requestAnimationFrame(loop);
    };

    animRef.current.frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current.frameId);
  }, [updateGeometry]);

  useEffect(() => {
    animRef.current.tgt = unfolded ? 1 : 0;
  }, [unfolded]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{
        display: 'block',
        cursor: 'grab',
        background: 'transparent',
        border: '1px solid white',
        ...style,
      }}
      {...canvasProps}
    />
  );
};

export default IcosahedronGlobe;