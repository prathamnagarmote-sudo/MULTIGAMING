"use client";

import { useRef, useState, MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Play, Bookmark, Users, Star } from "lucide-react";

export interface Game {
  id: string;
  title: string;
  genre: string[];
  rating: number;
  players: string;
  image: string;
  isLive?: boolean;
}

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for a fluid feel
  const springConfig = { damping: 20, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Transform raw mouse values into rotation angles (max 15 degrees)
  const rotateX = useTransform(springY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalize coordinates between -0.5 and 0.5
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative w-full aspect-[3/4] rounded-2xl cursor-pointer group [perspective:1000px]"
    >
      {/* Dynamic Background Glow */}
      <motion.div 
        className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-electric-blue via-transparent to-neon-purple opacity-0 blur-2xl transition-opacity duration-500"
        animate={{ opacity: isHovered ? 0.4 : 0 }}
        style={{ transform: "translateZ(-50px)" }}
      />

      {/* Main Card Content */}
      <div 
        className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10 glass bg-black/60"
        style={{ transform: "translateZ(0px)" }}
      >
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
          <img 
            src={game.image} 
            alt={game.title}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10" style={{ transform: "translateZ(20px)" }}>
          {game.isLive ? (
            <div className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full flex items-center gap-2 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-500 tracking-wider uppercase">Live</span>
            </div>
          ) : (
            <div />
          )}
          <button className="w-8 h-8 rounded-full glass border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-white/40 transition-colors">
            <Bookmark className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10" style={{ transform: "translateZ(30px)" }}>
          {/* Genre Tags */}
          <div className="flex gap-2 mb-3">
            {game.genre.map((g) => (
              <span key={g} className="px-2 py-1 text-[10px] uppercase tracking-wider font-bold text-electric-blue border border-electric-blue/30 rounded-sm bg-electric-blue/10 backdrop-blur-md">
                {g}
              </span>
            ))}
          </div>

          <h3 className="text-2xl font-heading font-black text-white uppercase tracking-wide mb-2 group-hover:text-glow-blue transition-all">
            {game.title}
          </h3>

          <div className="flex items-center gap-4 text-sm text-white/70 font-sans mb-6">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-white">{game.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-neon-cyan" />
              <span>{game.players}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div 
            className="flex gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.3 }}
          >
            <button className="flex-1 bg-gradient-to-r from-electric-blue to-neon-cyan text-black font-bold font-heading uppercase py-2 rounded-sm flex items-center justify-center gap-2 hover:brightness-125 transition-all">
              <Play className="w-4 h-4 fill-black" />
              Play Now
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
