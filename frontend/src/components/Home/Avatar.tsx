"use client";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import * as THREE from "three";

const speed = 0.1;
const keys: any = {};

export default function Avatar() {
    const me = useRef<THREE.Mesh>(null!);
    const [others, setOthers] = useState<Record<string, { socketId: string; x: number; y: number; z: number }>>({});

    useFrame(() => {
        if (!me.current) return;

        if (keys["w"]) me.current.position.z -= speed;
        if (keys["s"]) me.current.position.z += speed;
        if (keys["a"]) me.current.position.x -= speed;
        if (keys["d"]) me.current.position.x += speed;

        socket.emit("move", me.current.position);
    });

    useEffect(() => {
        socket.on("player-move", (u: { socketId: string; x: number; y: number; z: number }) => {
            setOthers(o => ({ ...o, [u.socketId]: u }));
        });

        socket.on("user-left", (id: string) => {
            setOthers(o => {
                const c = { ...o };
                delete c[id];
                return c;
            });
        });
    }, []);

    return (
        <>
            <mesh ref={me} position={[0, 0.5, 0]}>
                <boxGeometry />
                <meshStandardMaterial color="blue" />
            </mesh>

            {Object.values(others).map(u => (
                <mesh key={u.socketId} position={[u.x, 0.5, u.z]}>
                    <boxGeometry />
                    <meshStandardMaterial color="red" />
                </mesh>
            ))}
        </>
    );
}

window.addEventListener("keydown", e => (keys[e.key] = true));
window.addEventListener("keyup", e => (keys[e.key] = false));
