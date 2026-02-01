"use client";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useMemo } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

const SPEED = 0.1;

interface ModelAvatarProps {
    isPlayer: boolean;
    position?: [number, number, number];
    onPositionChange?: (pos: THREE.Vector3) => void;
    targetPosition?: THREE.Vector3;
}

export default function ModelAvatar({
    isPlayer,
    position = [0, 0, 0],
    onPositionChange,
    targetPosition
}: ModelAvatarProps) {
    const group = useRef<THREE.Group>(null!);
    const keys = useRef<{ [key: string]: boolean }>({});
    const isMoving = useRef(false);
    const currentPosition = useRef(new THREE.Vector3(...position));

    // Load the GLB model
    const { scene, animations } = useGLTF("/exported-model.glb") as any;
    const { actions, mixer } = useAnimations(animations, group);

    // Clone the scene to allow multiple instances
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    // References for animation actions
    const idleAction = useRef<THREE.AnimationAction | null>(null);
    const walkAction = useRef<THREE.AnimationAction | null>(null);
    const currentAction = useRef<THREE.AnimationAction | null>(null);

    // Initialize animations
    useEffect(() => {
        if (actions && Object.keys(actions).length > 0) {
            const animationNames = Object.keys(actions);
            console.log("Available animations:", animationNames);

            // Detect idle and walk animations by name patterns
            animationNames.forEach(name => {
                const lowerName = name.toLowerCase();
                if (lowerName.includes('idle') || lowerName.includes('stand')) {
                    idleAction.current = actions[name];
                    console.log("Found idle animation:", name);
                } else if (lowerName.includes('walk') || lowerName.includes('run')) {
                    walkAction.current = actions[name];
                    console.log("Found walk animation:", name);
                }
            });

            // If we didn't find specific animations, use the first two
            if (!idleAction.current && animationNames.length > 0) {
                idleAction.current = actions[animationNames[0]];
                console.log("Using first animation as idle:", animationNames[0]);
            }
            if (!walkAction.current && animationNames.length > 1) {
                walkAction.current = actions[animationNames[1]];
                console.log("Using second animation as walk:", animationNames[1]);
            }

            // Start with idle animation
            if (idleAction.current) {
                idleAction.current.play();
                currentAction.current = idleAction.current;
            }
        }
    }, [actions]);

    // Keyboard controls for player
    useEffect(() => {
        if (!isPlayer) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            keys.current[e.key.toLowerCase()] = true;
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            keys.current[e.key.toLowerCase()] = false;
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [isPlayer]);

    useFrame((state, delta) => {
        if (!group.current) return;

        if (isPlayer) {
            // Player movement
            let moved = false;
            const moveDirection = new THREE.Vector3();

            if (keys.current["w"]) { moveDirection.z -= 1; moved = true; }
            if (keys.current["s"]) { moveDirection.z += 1; moved = true; }
            if (keys.current["a"]) { moveDirection.x -= 1; moved = true; }
            if (keys.current["d"]) { moveDirection.x += 1; moved = true; }

            if (moved) {
                moveDirection.normalize();
                currentPosition.current.x += moveDirection.x * SPEED;
                currentPosition.current.z += moveDirection.z * SPEED;

                group.current.position.copy(currentPosition.current);

                // Rotate model to face movement direction
                if (moveDirection.length() > 0) {
                    const angle = Math.atan2(moveDirection.x, moveDirection.z);
                    group.current.rotation.y = angle;
                }

                // Notify parent of position change
                if (onPositionChange) {
                    onPositionChange(currentPosition.current);
                }

                isMoving.current = true;
            } else {
                isMoving.current = false;
            }
        } else if (targetPosition) {
            // Other players - smooth interpolation
            currentPosition.current.lerp(targetPosition, 0.1);
            group.current.position.copy(currentPosition.current);

            // Rotate towards movement direction
            const direction = new THREE.Vector3()
                .subVectors(targetPosition, currentPosition.current);

            if (direction.length() > 0.01) {
                const angle = Math.atan2(direction.x, direction.z);
                group.current.rotation.y = angle;
                isMoving.current = true;
            } else {
                isMoving.current = false;
            }
        }

        // Update animation mixer
        if (mixer) {
            mixer.update(delta);
        }

        // Switch between idle and walk animations
        if (isMoving.current) {
            // Switch to walk animation
            if (walkAction.current && currentAction.current !== walkAction.current) {
                if (currentAction.current) {
                    currentAction.current.fadeOut(0.3);
                }
                walkAction.current.reset().fadeIn(0.3).play();
                currentAction.current = walkAction.current;
            }
        } else {
            // Switch to idle animation
            if (idleAction.current && currentAction.current !== idleAction.current) {
                if (currentAction.current) {
                    currentAction.current.fadeOut(0.3);
                }
                idleAction.current.reset().fadeIn(0.3).play();
                currentAction.current = idleAction.current;
            }
        }
    });

    return (
        <group ref={group} position={position}>
            <primitive
                object={clonedScene}
                scale={1}
            />
        </group>
    );
}

// Preload the model
useGLTF.preload("/exported-model.glb");
