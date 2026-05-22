"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Image as DreiImage, ScrollControls, useScroll, Stars } from "@react-three/drei";
import * as THREE from "three";

const IMAGES = [
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800",
  "https://images.unsplash.com/photo-1614294149010-950b698f72c0?q=80&w=800",
  "https://images.unsplash.com/photo-1614294148960-9aa740632a87?q=80&w=800",
  "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=800",
  "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800"
];

function GameNode({ position, game, onHover }: { position: [number, number, number], game: any, onHover: (g: any) => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state, delta) => {
    if (!ref.current) return;
    
    // Smooth scale on hover
    const targetScale = hovered ? 1.15 : 1;
    ref.current.scale.x = THREE.MathUtils.lerp(ref.current.scale.x, targetScale * 2.5, 10 * delta);
    ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, targetScale * 3.5, 10 * delta);
    
    // Float slightly
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.1;
    
    // Tilt towards mouse slightly if hovered (fake lookAt effect)
    if (hovered) {
      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, state.pointer.x * 0.5, 5 * delta);
      ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -state.pointer.y * 0.5, 5 * delta);
    } else {
      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, 0, 5 * delta);
      ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, 0, 5 * delta);
    }
  });

  return (
    <DreiImage
      ref={ref as any}
      url={game.image}
      position={position}
      scale={[2.5, 3.5]} // default scale
      transparent
      opacity={hovered ? 1 : 0.6}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(game);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
        document.body.style.cursor = 'auto';
      }}
    />
  );
}

function GridContent({ setHoveredGame }: { setHoveredGame: (g: any) => void }) {
  const scroll = useScroll();
  const group = useRef<THREE.Group>(null);

  const games = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: `game-${i}`,
      title: `Project ${String.fromCharCode(65 + (i % 26))}-${i + 1}`,
      image: IMAGES[i % IMAGES.length],
      rating: (Math.random() * 2 + 3).toFixed(1),
      players: Math.floor(Math.random() * 500) + "K"
    }));
  }, []);

  useFrame(() => {
    if (group.current) {
      // Scroll maps 0-1 offset to the total vertical height of the grid
      const totalHeight = (games.length / 5) * 4.5;
      const y = scroll.offset * totalHeight;
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, y, 0.1);
    }
  });

  return (
    <group ref={group}>
      {games.map((game, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        // Curved panoramic layout
        const x = (col - 2) * 3.8;
        const z = -Math.abs(col - 2) * 0.8; // push edges back to create a curve
        const y = -row * 4.5 + 5; // start slightly above center

        return (
          <GameNode 
            key={game.id} 
            position={[x, y, z]} 
            game={game} 
            onHover={setHoveredGame} 
          />
        );
      })}
    </group>
  );
}

export function SpatialGrid() {
  const [hoveredGame, setHoveredGame] = useState<any>(null);

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        {/* We use pages={5} to give plenty of scroll room */}
        <ScrollControls pages={5} damping={0.2} distance={1.5}>
          <GridContent setHoveredGame={setHoveredGame} />
        </ScrollControls>
      </Canvas>

      {/* 2D Overlay for Hovered Game Info */}
      <div 
        className={`absolute right-10 top-1/2 -translate-y-1/2 w-80 p-6 glass-card rounded-2xl pointer-events-none transition-all duration-300 transform ${
          hoveredGame ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-10 scale-95'
        }`}
      >
        {hoveredGame && (
          <>
            <div className="w-full h-40 bg-black rounded-lg mb-4 overflow-hidden relative">
              <img src={hoveredGame.image} className="w-full h-full object-cover opacity-80" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            </div>
            <h3 className="text-3xl font-heading font-black text-white uppercase tracking-wide mb-2 text-glow-blue">
              {hoveredGame.title}
            </h3>
            <div className="flex gap-4 text-sm text-white/70 font-sans mb-6">
              <span className="flex items-center gap-1 font-bold text-white">⭐ {hoveredGame.rating}</span>
              <span className="text-neon-cyan flex items-center gap-1">👥 {hoveredGame.players} Active</span>
            </div>
            <div className="w-full py-4 bg-gradient-to-r from-electric-blue to-neon-cyan text-black font-black font-heading uppercase tracking-widest rounded-sm text-center shadow-[0_0_20px_rgba(0,240,255,0.4)]">
              Play Now
            </div>
          </>
        )}
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 font-sans text-sm tracking-widest uppercase flex flex-col items-center gap-2 pointer-events-none">
        <span>Scroll to explore</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </div>
  );
}
