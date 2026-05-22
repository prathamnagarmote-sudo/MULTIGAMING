"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Trophy } from "lucide-react";
import { GameData, getGamesDB } from "@/utils/db";

interface HeroBannerProps {
  onPlayGame: (id: string) => void;
}

export function HeroBanner({ onPlayGame }: HeroBannerProps) {
  const [slideGames, setSlideGames] = useState<GameData[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Load dynamically on mount
  useEffect(() => {
    const all = getGamesDB();
    const heroes = all.filter((g) => g.isHero);
    if (heroes.length > 0) {
      setSlideGames(heroes.slice(0, 4));
    } else {
      // fallback default top 4
      setSlideGames(all.slice(0, 4));
    }
  }, []);

  // Auto-play sliding functionality
  useEffect(() => {
    if (isHovered || slideGames.length === 0) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % slideGames.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered, slideGames]);

  if (slideGames.length === 0) {
    return (
      <div className="h-[360px] md:h-[480px] rounded-2xl bg-white/[0.01] border border-white/[0.04] flex items-center justify-center text-white/20 text-xs font-mono mb-8">
        Loading Featured Arena...
      </div>
    );
  }

  const activeGame = slideGames[activeIdx];

  return (
    <div className="mb-8">
      {/* Main Sliding Windows Dashboard */}
      <section
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative -mx-6 h-[360px] md:h-[480px] overflow-hidden border border-white/[0.08] bg-[#030303] shadow-[0_20px_50px_rgba(0,0,0,0.65)] rounded-2xl flex flex-row select-none"
      >
        {/* LEFT VIEW: Active Featured Game Banner (80%) */}
        <div className="relative flex-1 h-full overflow-hidden w-[75%] md:w-[80%] bg-black">
          {/* Spatial Cyber Grid Mesh Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] z-10 pointer-events-none" />

          {/* Animate slide background replacement */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeGame.id}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={activeGame.banner || activeGame.thumbnail}
                alt={activeGame.title}
                className="w-full h-full object-cover brightness-[0.6] contrast-[1.05] saturation-[1.1]"
              />
            </motion.div>
          </AnimatePresence>

          {/* Clean Overlay Shadows for content text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030303]/95 via-transparent to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none" />

          {/* Tagline Badge (Top Left of Active Display) */}
          <div className="absolute top-5 left-5 z-20">
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-widest bg-black/50 text-white border border-white/10 rounded-lg backdrop-blur-md">
              <Trophy size={11} className="text-amber-400" /> Featured Game
            </span>
          </div>

          {/* Dynamic Details Overlay (Bottom Left & Right) */}
          <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 z-20 flex flex-col md:flex-row md:items-end justify-between gap-4 pointer-events-none">
            {/* Metadata Text */}
            <div className="flex items-center gap-4">
              <img
                src={activeGame.thumbnail}
                alt={`${activeGame.title} Icon`}
                className="w-14 h-14 rounded-2xl object-cover border border-white/20 shadow-[0_8px_16px_rgba(0,0,0,0.6)] shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-white/50 font-mono">
                  {activeGame.genre}
                </span>
                <h2 className="text-2xl md:text-4xl font-heading font-black text-white uppercase italic tracking-tighter drop-shadow-md leading-none mb-1">
                  {activeGame.title}
                </h2>
                <p className="hidden md:block text-xs text-white/55 max-w-md leading-relaxed">
                  {activeGame.description}
                </p>
              </div>
            </div>

            {/* Glowing Orange/Vibrant Play Button (Bottom Right) */}
            <div className="pointer-events-auto shrink-0">
              <button
                onClick={() => onPlayGame(activeGame.id)}
                className={`group flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r ${
                  activeGame.buttonGradient || "from-[#ff9f0a] to-[#ff5e00]"
                } text-white font-heading font-black text-xs uppercase tracking-widest hover:brightness-110 hover:scale-[1.03] shadow-[0_0_20px_rgba(255,159,10,0.3)] transition-all duration-300 cursor-pointer`}
              >
                <Play size={12} className="fill-white text-white" />
                Play Now
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT VIEW: Dynamic Game Selector Tabs (20%) */}
        <div className="w-[25%] md:w-[20%] h-full flex flex-col border-l border-white/[0.08] bg-[#070707] z-20">
          {slideGames.map((game, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={game.id}
                onClick={() => setActiveIdx(idx)}
                className={`w-full h-1/4 relative overflow-hidden flex flex-col justify-end p-3 border-b border-white/[0.05] last:border-b-0 transition-all duration-300 text-left cursor-pointer group ${
                  isActive ? "bg-white/[0.03]" : "hover:bg-white/[0.01]"
                }`}
              >
                {/* Thumbnail Background */}
                <img
                  src={game.banner || game.thumbnail}
                  alt={game.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                    isActive
                      ? "brightness-[0.4] scale-105"
                      : "brightness-[0.18] grayscale opacity-40 group-hover:brightness-[0.28] group-hover:grayscale-[50%] group-hover:opacity-70"
                  }`}
                />

                {/* Cyberpunk Scanner Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[size:100%_4px] opacity-20 pointer-events-none z-10" />

                {/* Glowing Outline highlight for currently active slide */}
                {isActive && (
                  <div
                    className="absolute inset-0 border-2 rounded-sm pointer-events-none z-20 shadow-[inset_0_0_12px_rgba(255,159,10,0.3)] transition-all duration-300"
                    style={{ borderColor: game.accentColor || "#ff9f0a" }}
                  />
                )}

                {/* Slide index overlay indicator (Top-right of tab) */}
                <div className="absolute top-2.5 right-2.5 z-10 text-[8px] font-bold text-white/20 font-mono">
                  {`0${idx + 1}`}
                </div>

                {/* Title & Category text overlay */}
                <div className="relative z-10 flex flex-col pointer-events-none select-none">
                  <span
                    className="text-[8px] font-bold uppercase tracking-widest mb-0.5"
                    style={{ color: isActive ? (game.accentColor || "#ff9f0a") : "rgba(255,255,255,0.25)" }}
                  >
                    {game.genre.split(" / ")[0]}
                  </span>
                  <span
                    className={`text-[10px] md:text-[11px] font-black uppercase tracking-wide truncate ${
                      isActive ? "text-white" : "text-white/40"
                    }`}
                  >
                    {game.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

