"use strict";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useMemo } from "react";
import { socket } from "@/lib/socket";
import * as THREE from "three";

const SPEED = 0.1;
const LERP_FACTOR = 0.1; // Smoothing factor for interpolation
const NETWORK_TICK_RATE = 50; // ms

interface PlayerState {
    socketId: string;
    position: THREE.Vector3;
    targetPosition: THREE.Vector3;
}

export default function Avatar() {
    const meRef = useRef<THREE.Mesh>(null!);
    // We use a ref for 'others' logic to avoid re-renders on every frame
    const othersData = useRef<Map<string, PlayerState>>(new Map());
    // We need a group to hold other players' meshes. We will manage them manually or use a force-update for structure changes.
    // However, the cleanest React-way without re-renders for positions is to separate list-state from position-state.
    // For simplicity in this POC refactor, we will maintain a React state ONLY for the LIST of players (joins/leaves),
    // but their POSITIONS will be updated via refs.
    const [othersList, setOthersList] = React.useState<string[]>([]);

    // Refs for meshes of other players
    const otherMeshes = useRef<Map<string, THREE.Mesh>>(new Map());

    // Input state
    const keys = useRef<{ [key: string]: boolean }>({});
    const lastEmittedPosition = useRef<THREE.Vector3>(new THREE.Vector3());
    const lastEmitTime = useRef<number>(0);

    // Setup Socket Listeners
    useEffect(() => {
        const onMove = (u: { socketId: string; x: number; y: number; z: number }) => {
            const current = othersData.current.get(u.socketId);
            const newTarget = new THREE.Vector3(u.x, u.y, u.z);

            if (current) {
                // Update target for interpolation
                current.targetPosition.copy(newTarget);
            } else {
                // New player moved and we didn't know them (edge case) OR logic handled in separate join event?
                // The original code handled joins implicitly via move events. We'll stick to that.
                if (!othersList.includes(u.socketId)) {
                    setOthersList(prev => [...prev, u.socketId]);
                }
                othersData.current.set(u.socketId, {
                    socketId: u.socketId,
                    position: newTarget.clone(), // Start where they are
                    targetPosition: newTarget.clone()
                });
            }
        };

        const onUserLeft = (id: string) => {
            othersData.current.delete(id);
            otherMeshes.current.delete(id);
            setOthersList(prev => prev.filter(pid => pid !== id));
        };

        socket.on("player-move", onMove);
        socket.on("user-left", onUserLeft);

        return () => {
            socket.off("player-move", onMove);
            socket.off("user-left", onUserLeft);
        };
    }, [othersList]);

    // Setup Keyboard Listeners
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key] = true; };
        const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key] = false; };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    useFrame(({ clock }) => {
        const now = clock.getElapsedTime() * 1000;

        // 1. Handle MY movement
        if (meRef.current) {
            const pos = meRef.current.position;
            let moved = false;

            if (keys.current["w"] || keys.current["W"]) { pos.z -= SPEED; moved = true; }
            if (keys.current["s"] || keys.current["S"]) { pos.z += SPEED; moved = true; }
            if (keys.current["a"] || keys.current["A"]) { pos.x -= SPEED; moved = true; }
            if (keys.current["d"] || keys.current["D"]) { pos.x += SPEED; moved = true; }

            // Throttled Network Emission
            if (moved && (now - lastEmitTime.current > NETWORK_TICK_RATE)) {
                // Only emit if position changed significantly? Optional optimization.
                if (pos.distanceToSquared(lastEmittedPosition.current) > 0.0001) {
                    socket.emit("move", { x: pos.x, y: pos.y, z: pos.z });
                    lastEmittedPosition.current.copy(pos);
                    lastEmitTime.current = now;
                }
            }
        }

        // 2. Interpolate OTHERS
        othersList.forEach(socketId => {
            const state = othersData.current.get(socketId);
            const mesh = otherMeshes.current.get(socketId);

            if (state && mesh) {
                // Smoothly interpolate current position to target position
                state.position.lerp(state.targetPosition, LERP_FACTOR);
                mesh.position.copy(state.position);
            }
        });
    });

    return (
        <>
            {/* My Avatar */}
            <mesh ref={meRef} position={[0, 0.5, 0]}>
                <boxGeometry />
                <meshStandardMaterial color="blue" />
            </mesh>

            {/* Other Avatars */}
            {othersList.map(id => (
                <mesh
                    key={id}
                    ref={(el) => {
                        if (el) otherMeshes.current.set(id, el);
                        else otherMeshes.current.delete(id);
                    }}
                    position={[0, -100, 0]}
                >
                    <boxGeometry />
                    <meshStandardMaterial color="red" />
                </mesh>
            ))}
        </>
    );
}

import React from "react";
