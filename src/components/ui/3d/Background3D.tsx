"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";
import * as THREE from "three";

// --- Particle Nebula ---
function ParticleNebula() {
  const ref = useRef<THREE.Points>(null);
  const count = 2200;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 20 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.4;
      arr[i * 3 + 2] = r * Math.cos(phi) - 10;
    }
    return arr;
  }, []);

  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const palette = [
      [0, 0.94, 1],   // cyan
      [0.72, 0, 1],   // purple
      [0, 0.6, 1],    // blue
      [1, 0, 1],      // pink
    ];
    for (let i = 0; i < count; i++) {
      const c = palette[Math.floor(Math.random() * palette.length)];
      arr[i * 3] = c[0];
      arr[i * 3 + 1] = c[1];
      arr[i * 3 + 2] = c[2];
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.018;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.008) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// --- Infinite Neon Grid ---
function NeonGrid() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    // Scroll the grid texture UV for infinite forward-motion feel
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    if (mat.map) {
      mat.map.offset.y = (state.clock.elapsedTime * 0.12) % 1;
    }
  });

  const gridTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "transparent";
    ctx.clearRect(0, 0, size, size);

    const drawLine = (x1: number, y1: number, x2: number, y2: number, alpha: number) => {
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, `rgba(0,240,255,0)`);
      grad.addColorStop(0.5, `rgba(0,240,255,${alpha})`);
      grad.addColorStop(1, `rgba(0,240,255,0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    const step = size / 8;
    for (let i = 0; i <= 8; i++) {
      drawLine(i * step, 0, i * step, size, 0.6);
      drawLine(0, i * step, size, i * step, 0.6);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 6);
    return tex;
  }, []);

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
      <planeGeometry args={[120, 120]} />
      <meshBasicMaterial
        map={gridTexture}
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </mesh>
  );
}

// --- Glowing Energy Orb ---
function EnergyOrb({ position, color, size, speed }: {
  position: [number, number, number];
  color: string;
  size: number;
  speed: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current || !ringRef.current) return;
    const t = state.clock.elapsedTime * speed;
    ref.current.position.y = position[1] + Math.sin(t) * 1.5;
    ref.current.position.x = position[0] + Math.cos(t * 0.7) * 0.8;
    ringRef.current.rotation.x = t * 1.2;
    ringRef.current.rotation.z = t * 0.8;
    ringRef.current.position.y = ref.current.position.y;
    ringRef.current.position.x = ref.current.position.x;
  });

  return (
    <>
      <mesh ref={ref} position={position}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.5}
          transparent
          opacity={0.85}
          roughness={0}
          metalness={0.3}
        />
      </mesh>
      <mesh ref={ringRef} position={position}>
        <torusGeometry args={[size * 2.5, size * 0.08, 16, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={3}
          transparent
          opacity={0.5}
        />
      </mesh>
    </>
  );
}

// --- Floating Holographic Ring ---
function HolographicRing({ position, radius, speed, axis }: {
  position: [number, number, number];
  radius: number;
  speed: number;
  axis: "x" | "y" | "z";
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    if (axis === "x") ref.current.rotation.x = t;
    if (axis === "y") ref.current.rotation.y = t;
    if (axis === "z") ref.current.rotation.z = t;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4) * 0.8;
  });

  return (
    <group ref={ref} position={position}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[i * Math.PI / 3, i * Math.PI / 4, 0]}>
          <torusGeometry args={[radius, 0.04, 8, 80]} />
          <meshStandardMaterial
            color="#00F0FF"
            emissive="#00F0FF"
            emissiveIntensity={2}
            transparent
            opacity={0.4 - i * 0.1}
            wireframe={i === 2}
          />
        </mesh>
      ))}
    </group>
  );
}

// --- Floating Geometric Debris ---
function GeometricDebris() {
  const shapes = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    position: [
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 20,
      -15 - Math.random() * 25,
    ] as [number, number, number],
    rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
    speed: 0.2 + Math.random() * 0.5,
    scale: 0.15 + Math.random() * 0.4,
    color: Math.random() > 0.5 ? "#00F0FF" : "#B800FF",
    type: Math.floor(Math.random() * 3),
  })), []);

  return (
    <>
      {shapes.map((s) => (
        <FloatingShape key={s.id} {...s} />
      ))}
    </>
  );
}

function FloatingShape({ position, rotation, speed, scale, color, type }: any) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x += speed * 0.01;
    ref.current.rotation.y += speed * 0.015;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed * 0.5) * 1.5;
  });

  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
        {type === 0 && <octahedronGeometry args={[1]} />}
        {type === 1 && <tetrahedronGeometry args={[1]} />}
        {type === 2 && <icosahedronGeometry args={[1]} />}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

// --- Aurora Plasma Waves ---
function AuroraPlane() {
  const meshRef = useRef<THREE.Mesh>(null);

  const shader = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        vUv = uv;
        vec3 pos = position;
        pos.z += sin(pos.x * 0.5 + uTime) * 0.8 
               + cos(pos.y * 0.3 + uTime * 0.7) * 0.5;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        float wave1 = sin(vUv.x * 8.0 + uTime * 0.8) * 0.5 + 0.5;
        float wave2 = cos(vUv.y * 6.0 - uTime * 0.6) * 0.5 + 0.5;
        float combined = (wave1 + wave2) * 0.5;
        
        vec3 cyan = vec3(0.0, 0.94, 1.0);
        vec3 purple = vec3(0.72, 0.0, 1.0);
        vec3 pink = vec3(1.0, 0.0, 0.8);
        
        vec3 color = mix(cyan, purple, wave1);
        color = mix(color, pink, wave2 * 0.4);
        
        float alpha = combined * 0.12;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh ref={meshRef} position={[0, 5, -20]} rotation={[0.1, 0, 0]}>
      <planeGeometry args={[80, 30, 32, 32]} />
      <shaderMaterial {...shader} />
    </mesh>
  );
}

// --- Main Background Canvas ---
export function Background3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 2, 12], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 5]} color="#00F0FF" intensity={2} />
        <pointLight position={[-15, -5, -10]} color="#B800FF" intensity={2} />
        <pointLight position={[0, -5, 5]} color="#FF00FF" intensity={0.8} />

        {/* Deep Stars */}
        <Stars radius={120} depth={60} count={4000} factor={3} saturation={0.5} fade speed={0.5} />

        {/* Aurora plasma */}
        <AuroraPlane />

        {/* Infinite Neon Grid Floor */}
        <NeonGrid />

        {/* Particle Nebula Cloud */}
        <ParticleNebula />

        {/* Energy Orbs */}
        <EnergyOrb position={[-14, 2, -8]} color="#00F0FF" size={0.5} speed={0.4} />
        <EnergyOrb position={[16, -1, -12]} color="#B800FF" size={0.7} speed={0.3} />
        <EnergyOrb position={[-8, 4, -15]} color="#FF00FF" size={0.4} speed={0.5} />
        <EnergyOrb position={[20, 3, -6]} color="#00FFFF" size={0.35} speed={0.6} />

        {/* Holographic Rings */}
        <HolographicRing position={[-18, 2, -10]} radius={2.5} speed={0.4} axis="y" />
        <HolographicRing position={[18, 0, -14]} radius={3} speed={0.25} axis="x" />
        <HolographicRing position={[0, -3, -18]} radius={4} speed={0.15} axis="z" />

        {/* Floating Geometric Debris */}
        <GeometricDebris />
      </Canvas>
    </div>
  );
}
