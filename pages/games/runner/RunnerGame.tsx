/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment } from './components/World/Environment';
import { Player } from './components/World/Player';
import { LevelManager } from './components/World/LevelManager';
import { Effects } from './components/World/Effects';
import { HUD } from './components/UI/HUD';
import { useStore } from './store';

// Dynamic Camera Controller
const CameraController = () => {
  const { camera, size } = useThree();
  const { laneCount } = useStore();

  useFrame((state, delta) => {
    // Determine if screen is narrow (mobile portrait)
    const aspect = size.width / size.height;
    const isMobile = aspect < 1.2; // Threshold for "mobile-like" narrowness or square-ish displays

    // Calculate expansion factors
    // Mobile requires backing up significantly more because vertical FOV is fixed in Three.js,
    // meaning horizontal view shrinks as aspect ratio drops.
    // We use more aggressive multipliers for mobile to keep outer lanes in frame.
    const heightFactor = isMobile ? 2.0 : 0.5;
    const distFactor = isMobile ? 4.5 : 1.0;

    // Base (3 lanes): y=5.5, z=8
    // Calculate target based on how many extra lanes we have relative to the start
    const extraLanes = Math.max(0, laneCount - 3);

    const targetY = 5.5 + (extraLanes * heightFactor);
    const targetZ = 8.0 + (extraLanes * distFactor);

    const targetPos = new THREE.Vector3(0, targetY, targetZ);

    // Smoothly interpolate camera position
    camera.position.lerp(targetPos, delta * 2.0);

    // Look further down the track to see the end of lanes
    // Adjust look target slightly based on height to maintain angle
    camera.lookAt(0, 0, -30);
  });

  return null;
};

function Scene() {
  return (
    <>
      <Environment />
      <group>
        {/* Attach a userData to identify player group for LevelManager collision logic */}
        <group userData={{ isPlayer: true }} name="PlayerGroup">
          <Player />
        </group>
        <LevelManager />
      </group>
      <Effects />
    </>
  );
}

function RunnerGame({ onBack }: { onBack: () => void }) {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <HUD onExit={onBack} />
      <button
        onClick={onBack}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-6 py-3 bg-black/40 backdrop-blur-md text-emerald-400 font-cyber font-bold rounded-xl border border-emerald-500/30 hover:bg-black/60 hover:border-emerald-500/60 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
        EXIT RUNNER
      </button>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: false, stencil: false, depth: true, powerPreference: "high-performance" }}
        // Initial camera, matches the controller base
        camera={{ position: [0, 5.5, 8], fov: 60 }}
      >
        <CameraController />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default RunnerGame;
