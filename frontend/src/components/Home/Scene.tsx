import { useState } from "react";
import Avatar from "./Avatar";
import Office from "./Office";
import ThirdPersonCamera from "./ThirdPersonCamera";
import * as THREE from "three";

export default function Scene() {
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 0, 0));

  return (
    <>
      <Office />
      <Avatar onPlayerPositionChange={setPlayerPosition} />
      <ThirdPersonCamera target={playerPosition} />
    </>
  );
}
