import Avatar from "./Avatar";

export default function Scene() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      <Avatar />
    </>
  );
}
