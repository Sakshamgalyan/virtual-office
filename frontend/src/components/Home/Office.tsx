"use client";
import * as THREE from "three";

export default function Office() {
    // Office dimensions
    const officeWidth = 30;
    const officeDepth = 20;
    const wallHeight = 3;
    const wallThickness = 0.2;

    // Cabin configuration
    const cabinWidth = 4;
    const cabinDepth = 3;
    const cabinHeight = 2;

    return (
        <>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[officeWidth, officeDepth]} />
                <meshStandardMaterial
                    color="#e8e8e8"
                    roughness={0.8}
                    metalness={0.2}
                />
            </mesh>

            {/* Grid pattern on floor */}
            <gridHelper
                args={[officeWidth, 30, "#cccccc", "#dddddd"]}
                position={[0, 0.01, 0]}
            />

            {/* Outer Walls */}
            {/* Back wall */}
            <mesh position={[0, wallHeight / 2, -officeDepth / 2]} castShadow receiveShadow>
                <boxGeometry args={[officeWidth, wallHeight, wallThickness]} />
                <meshStandardMaterial color="#f5f5f5" />
            </mesh>

            {/* Front wall (entrance) */}
            <mesh position={[0, wallHeight / 2, officeDepth / 2]} castShadow receiveShadow>
                <boxGeometry args={[officeWidth, wallHeight, wallThickness]} />
                <meshStandardMaterial color="#f5f5f5" />
            </mesh>

            {/* Left wall */}
            <mesh position={[-officeWidth / 2, wallHeight / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[wallThickness, wallHeight, officeDepth]} />
                <meshStandardMaterial color="#f5f5f5" />
            </mesh>

            {/* Right wall */}
            <mesh position={[officeWidth / 2, wallHeight / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[wallThickness, wallHeight, officeDepth]} />
                <meshStandardMaterial color="#f5f5f5" />
            </mesh>

            {/* Ceiling */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, wallHeight, 0]} receiveShadow>
                <planeGeometry args={[officeWidth, officeDepth]} />
                <meshStandardMaterial
                    color="#ffffff"
                    roughness={0.9}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Cabins - Left side */}
            {[0, 1, 2].map((i) => (
                <group key={`cabin-left-${i}`} position={[-10, 0, -6 + i * 5]}>
                    {/* Cabin back wall */}
                    <mesh position={[0, cabinHeight / 2, -cabinDepth / 2]} castShadow receiveShadow>
                        <boxGeometry args={[cabinWidth, cabinHeight, 0.1]} />
                        <meshStandardMaterial color="#d4e3f5" transparent opacity={0.9} />
                    </mesh>

                    {/* Cabin left wall */}
                    <mesh position={[-cabinWidth / 2, cabinHeight / 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.1, cabinHeight, cabinDepth]} />
                        <meshStandardMaterial color="#d4e3f5" transparent opacity={0.9} />
                    </mesh>

                    {/* Cabin right wall */}
                    <mesh position={[cabinWidth / 2, cabinHeight / 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.1, cabinHeight, cabinDepth]} />
                        <meshStandardMaterial color="#d4e3f5" transparent opacity={0.9} />
                    </mesh>

                    {/* Desk */}
                    <mesh position={[0, 0.4, -0.8]} castShadow receiveShadow>
                        <boxGeometry args={[3, 0.05, 1.2]} />
                        <meshStandardMaterial color="#8b4513" roughness={0.7} />
                    </mesh>

                    {/* Desk legs */}
                    {[-1, 1].map((x) =>
                        [-0.4, 0.4].map((z) => (
                            <mesh
                                key={`leg-${x}-${z}`}
                                position={[x * 1.3, 0.2, -0.8 + z]}
                                castShadow
                            >
                                <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
                                <meshStandardMaterial color="#654321" />
                            </mesh>
                        ))
                    )}

                    {/* Chair */}
                    <mesh position={[0, 0.25, 0.5]} castShadow receiveShadow>
                        <boxGeometry args={[0.6, 0.05, 0.6]} />
                        <meshStandardMaterial color="#2c3e50" />
                    </mesh>
                    <mesh position={[0, 0.5, 0.2]} castShadow receiveShadow>
                        <boxGeometry args={[0.6, 0.5, 0.05]} />
                        <meshStandardMaterial color="#2c3e50" />
                    </mesh>
                </group>
            ))}

            {/* Cabins - Right side */}
            {[0, 1, 2].map((i) => (
                <group key={`cabin-right-${i}`} position={[10, 0, -6 + i * 5]}>
                    {/* Cabin back wall */}
                    <mesh position={[0, cabinHeight / 2, -cabinDepth / 2]} castShadow receiveShadow>
                        <boxGeometry args={[cabinWidth, cabinHeight, 0.1]} />
                        <meshStandardMaterial color="#f5e6d4" transparent opacity={0.9} />
                    </mesh>

                    {/* Cabin left wall */}
                    <mesh position={[-cabinWidth / 2, cabinHeight / 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.1, cabinHeight, cabinDepth]} />
                        <meshStandardMaterial color="#f5e6d4" transparent opacity={0.9} />
                    </mesh>

                    {/* Cabin right wall */}
                    <mesh position={[cabinWidth / 2, cabinHeight / 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.1, cabinHeight, cabinDepth]} />
                        <meshStandardMaterial color="#f5e6d4" transparent opacity={0.9} />
                    </mesh>

                    {/* Desk */}
                    <mesh position={[0, 0.4, -0.8]} castShadow receiveShadow>
                        <boxGeometry args={[3, 0.05, 1.2]} />
                        <meshStandardMaterial color="#8b4513" roughness={0.7} />
                    </mesh>

                    {/* Desk legs */}
                    {[-1, 1].map((x) =>
                        [-0.4, 0.4].map((z) => (
                            <mesh
                                key={`leg-${x}-${z}`}
                                position={[x * 1.3, 0.2, -0.8 + z]}
                                castShadow
                            >
                                <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
                                <meshStandardMaterial color="#654321" />
                            </mesh>
                        ))
                    )}

                    {/* Chair */}
                    <mesh position={[0, 0.25, 0.5]} castShadow receiveShadow>
                        <boxGeometry args={[0.6, 0.05, 0.6]} />
                        <meshStandardMaterial color="#2c3e50" />
                    </mesh>
                    <mesh position={[0, 0.5, 0.2]} castShadow receiveShadow>
                        <boxGeometry args={[0.6, 0.5, 0.05]} />
                        <meshStandardMaterial color="#2c3e50" />
                    </mesh>
                </group>
            ))}

            {/* Meeting table in center */}
            <group position={[0, 0, 2]}>
                <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                    <boxGeometry args={[6, 0.05, 2.5]} />
                    <meshStandardMaterial color="#654321" roughness={0.6} metalness={0.3} />
                </mesh>

                {/* Table legs */}
                {[-2.5, 2.5].map((x) =>
                    [-1, 1].map((z) => (
                        <mesh
                            key={`table-leg-${x}-${z}`}
                            position={[x, 0.2, z]}
                            castShadow
                        >
                            <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
                            <meshStandardMaterial color="#4a2511" />
                        </mesh>
                    ))
                )}

                {/* Meeting chairs */}
                {[-3, -1.5, 0, 1.5, 3].map((x, i) => (
                    <group key={`meeting-chair-${i}`} position={[x, 0, -2]}>
                        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
                            <boxGeometry args={[0.5, 0.05, 0.5]} />
                            <meshStandardMaterial color="#34495e" />
                        </mesh>
                        <mesh position={[0, 0.5, -0.2]} castShadow receiveShadow>
                            <boxGeometry args={[0.5, 0.5, 0.05]} />
                            <meshStandardMaterial color="#34495e" />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* Ceiling lights */}
            {[-8, 0, 8].map((x) =>
                [-5, 5].map((z) => (
                    <group key={`light-${x}-${z}`} position={[x, wallHeight - 0.2, z]}>
                        <pointLight
                            intensity={0.5}
                            distance={10}
                            castShadow
                            shadow-mapSize-width={1024}
                            shadow-mapSize-height={1024}
                        />
                        <mesh>
                            <boxGeometry args={[1, 0.1, 1]} />
                            <meshStandardMaterial
                                color="#ffffff"
                                emissive="#ffff99"
                                emissiveIntensity={0.5}
                            />
                        </mesh>
                    </group>
                ))
            )}

            {/* Reception desk at entrance */}
            <group position={[0, 0, 8]}>
                <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                    <boxGeometry args={[5, 0.05, 1.5]} />
                    <meshStandardMaterial color="#8b4513" roughness={0.6} />
                </mesh>

                {/* Reception desk front panel */}
                <mesh position={[0, 0.25, 0.7]} castShadow receiveShadow>
                    <boxGeometry args={[5, 0.5, 0.05]} />
                    <meshStandardMaterial color="#6d3611" />
                </mesh>
            </group>

            {/* Potted plants for decoration */}
            {[
                [-12, 0, -8],
                [12, 0, -8],
                [-12, 0, 8],
                [12, 0, 8]
            ].map((pos, i) => (
                <group key={`plant-${i}`} position={pos as [number, number, number]}>
                    {/* Pot */}
                    <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
                        <cylinderGeometry args={[0.3, 0.25, 0.4, 16]} />
                        <meshStandardMaterial color="#8b4513" />
                    </mesh>
                    {/* Plant */}
                    <mesh position={[0, 0.6, 0]} castShadow>
                        <coneGeometry args={[0.4, 0.8, 8]} />
                        <meshStandardMaterial color="#228b22" />
                    </mesh>
                </group>
            ))}
        </>
    );
}
