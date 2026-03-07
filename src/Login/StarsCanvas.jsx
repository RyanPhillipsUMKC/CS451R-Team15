// src/Login/StarsCanvas.jsx
import { useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Preload } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";

const Stars = (props) => {
  const ref = useRef();

  // Bigger sphere, more stars
  const [positions] = useState(() =>
    random.inSphere(new Float32Array(15000 * 3), { radius: 100 }) // bigger radius
  );

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta / 30; // slower, smoother rotation
      ref.current.rotation.y += delta / 25;
    }
  });

  return (
    <group rotation={[0, 0, 0]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.13} // bigger points
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

export default function StarsCanvas() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}> {/* camera inside star sphere */}
        <Suspense fallback={null}>
          <Stars />
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
}