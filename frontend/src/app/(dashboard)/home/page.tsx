"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Scene from "@/components/Home/Scene";

export default function Home() {
  return (
    <Canvas camera={{ position: [0, 3, 10] }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} />
      <Scene />
      <OrbitControls />
    </Canvas>
  );
}
