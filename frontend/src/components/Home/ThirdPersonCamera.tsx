"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThirdPersonCameraProps {
    target: THREE.Vector3;
}

export default function ThirdPersonCamera({ target }: ThirdPersonCameraProps) {
    const { camera } = useThree();
    const cameraOffset = useRef(new THREE.Vector3(0, 5, 8)); // Behind and above the player
    const currentLookAt = useRef(new THREE.Vector3());

    useEffect(() => {
        // Set initial camera position
        camera.position.copy(target).add(cameraOffset.current);
        currentLookAt.current.copy(target);
        camera.lookAt(currentLookAt.current);
    }, [camera, target]);

    useFrame(() => {
        // Calculate desired camera position (behind and above the player)
        const desiredPosition = new THREE.Vector3()
            .copy(target)
            .add(cameraOffset.current);

        // Smoothly interpolate camera position
        camera.position.lerp(desiredPosition, 0.1);

        // Smoothly interpolate look-at target
        currentLookAt.current.lerp(target, 0.1);
        camera.lookAt(currentLookAt.current);

        // Add a point light that follows the player for better visibility
    });

    return (
        <>
            {/* Light that follows the player */}
            <pointLight
                position={[target.x, target.y + 3, target.z]}
                intensity={0.5}
                distance={15}
                castShadow
            />
        </>
    );
}
