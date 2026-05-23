"use client";

import { useRef, useState, useEffect, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Users, Flame, Sparkles } from "lucide-react";
import { GameData } from "@/utils/db";

interface GameTileProps {
  game: GameData;
  index: number;
  onClick?: () => void;
  compact?: boolean;
}

const PREVIEW_VIDEOS: Record<string, string> = {
  racing: "https://assets.mixkit.co/videos/preview/mixkit-retro-futuristic-grid-and-canyon-39846-large.mp4",
  shooting: "https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-futuristic-tunnel-39832-large.mp4",
  action: "https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-futuristic-tunnel-39832-large.mp4",
  multiplayer: "https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-futuristic-tunnel-39832-large.mp4",
  puzzle: "https://assets.mixkit.co/videos/preview/mixkit-neon-light-retro-music-background-with-grid-lines-39841-large.mp4",
  arcade: "https://assets.mixkit.co/videos/preview/mixkit-neon-light-retro-music-background-with-grid-lines-39841-large.mp4",
};

function getPreviewVideo(genre: string, id: string): string {
  if (id === "g1" || id === "f1" || genre.toLowerCase().includes("racing")) {
    return PREVIEW_VIDEOS.racing;
  }
  const key = genre.toLowerCase();
  for (const [k, url] of Object.entries(PREVIEW_VIDEOS)) {
    if (key.includes(k)) return url;
  }
  return PREVIEW_VIDEOS.puzzle;
}

export function GameTile({ game, index, onClick, compact = false }: GameTileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [shouldPlayVideo, setShouldPlayVideo] = useState(false);

  // Satisfying sequence: card scales up fully first, then the preview video loads
  useEffect(() => {
    if (!isHovered) {
      setShouldPlayVideo(false);
      return;
    }
    const timer = setTimeout(() => {
      setShouldPlayVideo(true);
    }, 450); // 450ms delay allows the 350ms scale transition to complete fully first
    return () => clearTimeout(timer);
  }, [isHovered]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current || compact) return; // Disable tilt in compact mode for cleaner layout scrolling
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -15, y: x * 15 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.4, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: compact 
          ? `scale(${isHovered ? 1.05 : 1})`
          : `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.06 : 1}) translateZ(${isHovered ? '20px' : '0px'})`,
        transition: isHovered
          ? "transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.35s ease-out"
          : "transform 0.4s ease-out, box-shadow 0.4s ease-out",
        boxShadow: isHovered
          ? compact
            ? "0 8px 20px -6px rgba(168, 85, 247, 0.4)"
            : "0 25px 50px -12px rgba(99, 102, 241, 0.45), 0 0 30px rgba(168, 85, 247, 0.25)"
          : "0 4px 6px -1px rgba(0, 0, 0, 0.15)",
        zIndex: isHovered ? 30 : 10,
      }}
      className="relative rounded-xl overflow-hidden cursor-pointer group w-full"
    >
      {/* Outer Glow Outline */}
      <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-electric-blue/0 via-neon-purple/0 to-electric-blue/0 group-hover:from-electric-blue/50 group-hover:via-neon-purple/35 group-hover:to-electric-blue/50 transition-all duration-500 z-0" />

      {/* Card Inner Wrapper */}
      <div className="relative z-10 rounded-xl overflow-hidden bg-[#12121a] border border-white/[0.08] group-hover:border-white/[0.18] transition-colors h-full flex flex-col">
        {/* Thumbnail and Video Area */}
        <div className="relative aspect-video overflow-hidden bg-black shrink-0">
          {/* Static Image Thumbnail */}
          <img
            src={game.thumbnail}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />

          {/* Inline Video Player Loop */}
          <AnimatePresence>
            {shouldPlayVideo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-10 w-full h-full bg-[#12121a]"
              >
                <video
                  src={game.previewVideo || getPreviewVideo(game.genre, game.id)}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-t-xl"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ambient Lighting Shades */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent opacity-85 z-20 pointer-events-none" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300 z-10 pointer-events-none" />

          {/* Status Badges */}
          <div className="absolute top-2 left-2 flex gap-1 z-20">
            {game.isHot && (
              <span className={`font-extrabold uppercase tracking-wider bg-orange-500/90 text-white rounded flex items-center gap-0.5 shadow-lg shadow-orange-500/30 ${
                compact ? "px-1 py-0.5 text-[7px]" : "px-2 py-0.5 text-[9px]"
              }`}>
                <Flame className={compact ? "w-2 h-2 fill-white" : "w-2.5 h-2.5 fill-white"} /> Hot
              </span>
            )}
            {game.isNew && (
              <span className={`font-extrabold uppercase tracking-wider bg-emerald-500/90 text-white rounded flex items-center gap-0.5 shadow-lg shadow-emerald-500/30 ${
                compact ? "px-1 py-0.5 text-[7px]" : "px-2 py-0.5 text-[9px]"
              }`}>
                <Sparkles className={compact ? "w-2 h-2" : "w-2.5 h-2.5"} /> New
              </span>
            )}
            {shouldPlayVideo && !compact && (
              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest bg-red-500/95 text-white rounded-md flex items-center gap-1 shadow-lg shadow-red-500/30 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> PREVIEW
              </span>
            )}
          </div>
        </div>

        {/* Text Info Box */}
        <div className={`pt-2.5 pb-3 relative z-20 bg-[#12121a] flex-1 flex flex-col justify-between ${
          compact ? "px-2" : "px-3.5"
        }`}>
          <h3 className={`font-bold text-white truncate group-hover:text-neon-cyan transition-colors duration-200 ${
            compact ? "text-xs" : "text-sm"
          }`}>
            {game.title}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-white/50 font-semibold uppercase tracking-wider font-mono ${
              compact ? "text-[8px]" : "text-[10px]"
            }`}>
              {game.genre}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`flex items-center gap-0.5 font-extrabold text-yellow-400/90 ${
                compact ? "text-[9px]" : "text-[11px]"
              }`}>
                <Star className="w-2.5 h-2.5 fill-yellow-400/90 text-yellow-400/90" />
                {game.rating}
              </span>
              {!compact && (
                <span className="flex items-center gap-0.5 text-[11px] font-bold text-white/55">
                  <Users className="w-2.5 h-2.5" />
                  {game.plays}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

