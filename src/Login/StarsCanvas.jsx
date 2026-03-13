// src/Login/StarsCanvas.jsx
import { useState, useRef, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial, Text, Preload } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

// Currency + crypto symbols
const SYMBOLS = [
  "$","£","€","¥","₹","₫","₩","₽","₺","₴","₦","₱","₡","₲","₵","₭","₮","₤",
  "₳","₯","₰","₨","₥","₠","₢","₣","₧","₪","₸","₼","₾","ƒ",
  "₿","Ξ","Ð","Ł","Ƀ"
];


// ⭐ Mouse camera movement
const CameraRig = () => {
  const { camera, mouse } = useThree();

  useFrame(() => {
    camera.position.x += (mouse.x * 10 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 6 - camera.position.y) * 0.05;

    camera.lookAt(0, 0, 0);
  });

  return null;
};


// ⭐ Stars
const Stars = () => {
  const ref = useRef();

  const [positions] = useState(() =>
    random.inSphere(new Float32Array(15000 * 3), { radius: 100 })
  );

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.02;
      ref.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.08}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
};


// ⭐ Floating currency symbols
const Symbols = () => {
  const groupRef = useRef();

  const count = 180;
  const radius = 80;

  const [positions] = useState(() =>
    Array.from({ length: count }, () => {
      const phi = Math.random() * Math.PI * 2;
      const costheta = Math.random() * 2 - 1;
      const u = Math.random();

      const theta = Math.acos(costheta);
      const r = radius * Math.cbrt(u);

      return {
        x: r * Math.sin(theta) * Math.cos(phi),
        y: r * Math.sin(theta) * Math.sin(phi),
        z: r * Math.cos(theta),
        symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        color: Math.random() > 0.5 ? "#FFD700" : "#00FF7F",
        speed: Math.random() * 0.6 + 0.1,
        offset: Math.random() * Math.PI * 2
      };
    })
  );

  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.y += 0.002;
    groupRef.current.rotation.x += 0.0015;

    groupRef.current.children.forEach((child, i) => {
      const p = positions[i];

      child.position.y =
        p.y +
        Math.sin(state.clock.elapsedTime * p.speed + p.offset) * 2;

      child.rotation.y += 0.01;
    });
  });

  return (
    <group ref={groupRef}>
      {positions.map((p, i) => (
        <Text
          key={i}
          position={[p.x, p.y, p.z]}
          fontSize={2}
          color={p.color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#ffffff"
        >
          {p.symbol}
        </Text>
      ))}
    </group>
  );
};


// ⭐ Main Canvas
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
        pointerEvents: "none"
      }}
    >
      <Canvas camera={{ position: [0, 0, 60], fov: 75 }}>
        
        {/* Fog for depth */}
        <fog attach="fog" args={["#000000", 40, 120]} />

        <Suspense fallback={null}>
          <CameraRig />
          <Stars />
          <Symbols />

          <EffectComposer>
            <Bloom
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              intensity={0.6}
            />
          </EffectComposer>

        </Suspense>

        <Preload all />
      </Canvas>
    </div>
  );
}
