"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface HeroBannerProps {
  onPlayGame?: (id: string) => void;
  onExploreCategory: (categoryId: string) => void;
}

const VIBRANT_BG_IMAGES = [
  {
    url: "https://res.cloudinary.com/dwk1cnlw2/image/upload/v1779780232/board_games_pa0hjc.png",
    title: "BOARD GAMES UNIVERSE",
    subtitle: "EXPLORE MIND STRATEGY & CLASSICS",
    targetId: "board-games"
  },
  {
    url: "https://res.cloudinary.com/dwk1cnlw2/image/upload/v1779875349/shooting_games_lbrscd.png",
    title: "SHOOTING GAMES ARENA",
    subtitle: "FPS, SCI-FI, & BATTLE ROYALE",
    targetId: "shooting-games"
  },
  {
    url: "https://res.cloudinary.com/dwk1cnlw2/image/upload/v1779875808/ChatGPT_Image_May_27_2026_03_26_25_PM_f16s4f.png",
    title: "RACING & DRIVING COLLECTION",
    subtitle: "HIGH-OCTANE SPEED & DRIFT CHALLENGES",
    targetId: "racing-games"
  },
  {
    url: "https://res.cloudinary.com/dwk1cnlw2/image/upload/v1779783542/arcade_games_high_resoltuion_fxo8ll.png",
    title: "ARCADE & CASUAL GAMES WORLD",
    subtitle: "RETRO PIXELS & INSTANT CLASSICS",
    targetId: "arcade-games"
  },
  {
    url: "https://res.cloudinary.com/dwk1cnlw2/image/upload/v1779874357/shooting_multiplayer_clash_rqrei7.png",
    title: "MULTIPLAYER CLASH BATTLES",
    subtitle: "TEAM UP & DOMINATE THE ARENA",
    targetId: "multiplayer-games"
  }
];

export function HeroBanner({ onPlayGame, onExploreCategory }: HeroBannerProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play sliding functionality (cross-fades every 5 seconds)
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % VIBRANT_BG_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % VIBRANT_BG_IMAGES.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + VIBRANT_BG_IMAGES.length) % VIBRANT_BG_IMAGES.length);
  };

  const activeSlide = VIBRANT_BG_IMAGES[activeIdx];

  return (
    <div className="mb-8">
      {/* 100% Elegant Centered Sliding Arena with Controlled Height */}
      <section
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-full aspect-[16/11] sm:aspect-[16/10] md:aspect-[1.9/1] max-h-[360px] sm:max-h-[480px] md:max-h-[560px] rounded-2xl overflow-hidden border border-white/[0.06] bg-[#030303] shadow-[0_20px_50px_rgba(0,0,0,0.65)] select-none group"
      >
        {/* Spatial Cyber Grid Mesh Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] z-10 pointer-events-none" />

        {/* Cyberpunk Scanline Scan Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.12)_50%)] bg-[size:100%_4px] opacity-15 pointer-events-none z-10" />

        {/* Animate slide background replacement */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={activeSlide.url}
              alt={activeSlide.title}
              className="relative z-10 w-full h-full object-cover brightness-[1.05] contrast-[1.02] saturation-[1.1] transition-transform duration-1000 ease-out group-hover:scale-[1.05] group-hover:brightness-[1.1]"
            />
          </motion.div>
        </AnimatePresence>

        {/* Ambient Shading Vignettes (Bottom-only for caption legibility, top and center remain fully bright) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none" />

        {/* Glassmorphic Minimal Brand Tagline overlay (Top-Left) */}
        <div className="absolute top-5 left-5 z-20 pointer-events-none select-none">
          <span className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-widest bg-black/60 text-white border border-white/10 rounded-lg backdrop-blur-md">
            <Sparkles size={11} className="text-electric-blue animate-pulse" />
            ZYLO ARCADE CHAMPIONSHIP
          </span>
        </div>

        {/* Bottom Banner Glassmorphic Label & Explore Button */}
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-20 flex flex-col md:flex-row md:items-end justify-between pointer-events-none gap-3 sm:gap-4">
          <div className="flex flex-col gap-0.5 sm:gap-1 select-none">
            <span className="text-[7.5px] sm:text-[9px] font-bold tracking-[0.2em] sm:tracking-[0.3em] text-electric-blue font-mono uppercase">
              {activeSlide.subtitle}
            </span>
            <h2 className="text-sm sm:text-base md:text-3xl font-heading font-black text-white uppercase italic tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              {activeSlide.title}
            </h2>
          </div>
          <div className="pointer-events-auto shrink-0">
            <button
              onClick={() => onExploreCategory(activeSlide.targetId)}
              className="flex items-center gap-1.5 px-4 py-2 sm:px-6 sm:py-3.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-electric-blue to-neon-cyan text-white font-heading font-black text-[9px] sm:text-xs uppercase tracking-widest hover:brightness-110 hover:scale-[1.03] shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300 cursor-pointer"
            >
              Explore Now
            </button>
          </div>
        </div>

        {/* Arrow Navigation (Fades in dynamically on hover) */}
        <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
          <button
            onClick={handlePrev}
            className="pointer-events-auto w-11 h-11 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-white/50 hover:text-electric-blue hover:bg-black/80 hover:border-electric-blue/50 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg backdrop-blur-md cursor-pointer hover:scale-105"
            title="Previous Background"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="pointer-events-auto w-11 h-11 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-white/50 hover:text-electric-blue hover:bg-black/80 hover:border-electric-blue/50 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg backdrop-blur-md cursor-pointer hover:scale-105"
            title="Next Background"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Glowy Dash Progress Indicators (Bottom Center) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {VIBRANT_BG_IMAGES.map((_, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${isActive
                    ? "w-8 bg-electric-blue shadow-[0_0_10px_#00f0ff]"
                    : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                title={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
