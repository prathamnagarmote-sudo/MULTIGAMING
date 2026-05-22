"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera, Stars } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

function FloatingObjects() {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={group}>
      {Array.from({ length: 15 }).map((_, i) => (
        <Float
          key={i}
          speed={1.5}
          rotationIntensity={2}
          floatIntensity={2}
          position={[
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20 - 10,
          ]}
        >
          <mesh>
            {i % 3 === 0 ? (
              <octahedronGeometry args={[0.5]} />
            ) : i % 3 === 1 ? (
              <torusGeometry args={[0.4, 0.1, 16, 32]} />
            ) : (
              <boxGeometry args={[0.6, 0.6, 0.6]} />
            )}
            <meshStandardMaterial
              color={i % 2 === 0 ? "#00F0FF" : "#B800FF"}
              emissive={i % 2 === 0 ? "#00F0FF" : "#B800FF"}
              emissiveIntensity={0.5}
              roughness={0.2}
              metalness={0.8}
              wireframe={i % 4 === 0}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} color="#00F0FF" intensity={1} />
          <pointLight position={[-10, -10, -10]} color="#B800FF" intensity={1} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <FloatingObjects />
        </Canvas>
      </div>

      {/* Lighting Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric-blue/10 rounded-full blur-[120px] z-10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black text-white uppercase tracking-tight leading-tight mb-6">
            Enter the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-neon-purple text-glow-blue">
              Next Generation
            </span>{" "}
            <br />
            of Gaming
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 font-sans tracking-wide"
        >
          Discover, compete, stream, and play in the ultimate gaming universe. 
          Experience unparalleled performance and community.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <button className="relative group px-8 py-4 bg-transparent overflow-hidden rounded-sm w-full sm:w-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-electric-blue to-neon-cyan opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-[1px] bg-black group-hover:bg-transparent transition-colors z-0" />
            <span className="relative z-10 text-white font-heading font-bold tracking-widest uppercase group-hover:text-black transition-colors">
              Play Now
            </span>
          </button>
          
          <button className="relative group px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden rounded-sm w-full sm:w-auto hover:border-neon-purple transition-colors">
            <div className="absolute inset-0 bg-neon-purple/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 text-white font-heading font-bold tracking-widest uppercase text-glow-purple">
              Explore Games
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
