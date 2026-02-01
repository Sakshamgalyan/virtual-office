"use client";
import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import * as THREE from "three";
import ModelAvatar from "./ModelAvatar";

const NETWORK_TICK_RATE = 50; // ms

interface PlayerState {
    socketId: string;
    position: THREE.Vector3;
    targetPosition: THREE.Vector3;
}

interface AvatarProps {
    onPlayerPositionChange?: (pos: THREE.Vector3) => void;
}

export default function Avatar({ onPlayerPositionChange }: AvatarProps = {}) {
    const [othersList, setOthersList] = useState<string[]>([]);
    const othersData = useRef<Map<string, PlayerState>>(new Map());
    const myPosition = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
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
                // New player moved
                if (!othersList.includes(u.socketId)) {
                    setOthersList(prev => [...prev, u.socketId]);
                }
                othersData.current.set(u.socketId, {
                    socketId: u.socketId,
                    position: newTarget.clone(),
                    targetPosition: newTarget.clone()
                });
            }
        };

        const onUserLeft = (id: string) => {
            othersData.current.delete(id);
            setOthersList(prev => prev.filter(pid => pid !== id));
        };

        socket.on("player-move", onMove);
        socket.on("user-left", onUserLeft);

        return () => {
            socket.off("player-move", onMove);
            socket.off("user-left", onUserLeft);
        };
    }, [othersList]);

    // Handle position updates from player model
    const handlePositionChange = (pos: THREE.Vector3) => {
        myPosition.current.copy(pos);

        // Notify parent for camera tracking
        if (onPlayerPositionChange) {
            onPlayerPositionChange(pos);
        }

        const now = Date.now();
        if (now - lastEmitTime.current > NETWORK_TICK_RATE) {
            if (pos.distanceToSquared(lastEmittedPosition.current) > 0.0001) {
                socket.emit("move", { x: pos.x, y: pos.y, z: pos.z });
                lastEmittedPosition.current.copy(pos);
                lastEmitTime.current = now;
            }
        }
    };

    return (
        <>
            {/* My Avatar */}
            <ModelAvatar
                isPlayer={true}
                position={[0, 0, 0]}
                onPositionChange={handlePositionChange}
            />

            {/* Other Avatars */}
            {othersList.map(id => {
                const state = othersData.current.get(id);
                return (
                    <ModelAvatar
                        key={id}
                        isPlayer={false}
                        targetPosition={state?.targetPosition}
                    />
                );
            })}
        </>
    );
}
