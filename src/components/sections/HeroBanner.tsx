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
    url: "https://res.cloudinary.com/dwk1cnlw2/image/upload/v1779513910/Loom_Screenshot_2026-05-23_at_10.53.17_amw1ek.png",
    title: "BOARD GAMES UNIVERSE",
    subtitle: "EXPLORE MIND STRATEGY & CLASSICS",
    targetId: "board-games"
  },
  {
    url: "https://res.cloudinary.com/dwk1cnlw2/image/upload/v1779513656/Loom_Screenshot_2026-05-23_at_10.47.45_skvjq9.png",
    title: "SHOOTING GAMES ARENA",
    subtitle: "FPS, SCI-FI, & BATTLE ROYALE",
    targetId: "shooting-games"
  },
  {
    url: "https://res.cloudinary.com/dwk1cnlw2/image/upload/v1779513572/Loom_Screenshot_2026-05-23_at_10.49.02_jyuawt.png",
    title: "RACING & DRIVING COLLECTION",
    subtitle: "HIGH-OCTANE SPEED & DRIFT CHALLENGES",
    targetId: "racing-games"
  },
  {
    url: "https://res.cloudinary.com/dwk1cnlw2/image/upload/v1779513799/Loom_Screenshot_2026-05-23_at_10.51.31_fbmbjs.png",
    title: "ARCADE & CASUAL GAMES WORLD",
    subtitle: "RETRO PIXELS & INSTANT CLASSICS",
    targetId: "arcade-games"
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
      {/* 100% Full-Width Aesthetic Sliding Arena */}
      <section
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative -mx-6 h-[420px] md:h-[560px] overflow-hidden border border-white/[0.08] bg-[#030303] shadow-[0_20px_50px_rgba(0,0,0,0.65)] rounded-2xl select-none group"
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
              className="w-full h-full object-cover brightness-[1.05] contrast-[1.02] saturation-[1.1]"
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
        <div className="absolute bottom-6 left-6 z-20 flex flex-col md:flex-row md:items-end justify-between right-6 pointer-events-none gap-4">
          <div className="flex flex-col gap-1 select-none">
            <span className="text-[9px] font-bold tracking-[0.3em] text-electric-blue font-mono uppercase">
              {activeSlide.subtitle}
            </span>
            <h2 className="text-xl md:text-3xl font-heading font-black text-white uppercase italic tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              {activeSlide.title}
            </h2>
          </div>
          <div className="pointer-events-auto">
            <button
              onClick={() => onExploreCategory(activeSlide.targetId)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-electric-blue to-neon-cyan text-white font-heading font-black text-xs uppercase tracking-widest hover:brightness-110 hover:scale-[1.03] shadow-[0_0_20px_rgba(255,0,85,0.3)] transition-all duration-300 cursor-pointer"
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

        {/* Glowy Dash Progress Indicators (Bottom Right) */}
        <div className="absolute bottom-6 right-6 z-20 flex gap-2">
          {VIBRANT_BG_IMAGES.map((_, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive 
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
