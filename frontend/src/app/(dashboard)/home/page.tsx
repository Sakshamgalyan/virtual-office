"use client";

import { Canvas } from "@react-three/fiber";
import Scene from "@/components/Home/Scene";

export default function Home() {
  return (
    <div className="w-full h-screen">
      <Canvas
        camera={{ position: [15, 10, 15], fov: 60 }}
        shadows
      >
        {/* Ambient light for overall illumination */}
        <ambientLight intensity={0.3} />

        {/* Main directional light (sunlight) with shadows */}
        <directionalLight
          position={[10, 15, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />

        {/* Secondary fill light */}
        <directionalLight
          position={[-5, 5, -5]}
          intensity={0.4}
        />

        {/* Hemisphere light for natural lighting */}
        <hemisphereLight
          args={["#ffffff", "#444444", 0.3]}
        />

        <Scene />
      </Canvas>
    </div>
  );
}
