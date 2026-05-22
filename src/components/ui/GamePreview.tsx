"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameData } from "@/data/mockGames";
import { Play, Star, Users, Monitor, Gamepad2, Bookmark, Share2 } from "lucide-react";

interface GamePreviewProps {
  game: GameData | null;
  anchorRect: DOMRect | null;
}

export function GamePreview({ game, anchorRect }: GamePreviewProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef) clearTimeout(timerRef);

    if (game && anchorRect) {
      const t = setTimeout(() => {
        const previewW = 360;
        const previewH = 450;
        const vW = window.innerWidth;
        const vH = window.innerHeight;

        let left = anchorRect.right + 14;
        if (left + previewW > vW - 16) left = anchorRect.left - previewW - 14;
        if (left < 260) left = anchorRect.left + anchorRect.width / 2 - previewW / 2;

        let top = anchorRect.top;
        if (top + previewH > vH - 16) top = vH - previewH - 16;
        if (top < 80) top = 80;

        setPosition({ top, left });
        setVisible(true);
      }, 180);
      setTimerRef(t);
    } else {
      setVisible(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, anchorRect]);

  return (
    <AnimatePresence>
      {visible && game && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "fixed", top: position.top, left: position.left, zIndex: 150, width: 360 }}
          className="pointer-events-none"
        >
          {/* Outer glow ring */}
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-electric-blue/40 via-neon-purple/20 to-electric-blue/40 blur-sm" />

          <div className="relative rounded-2xl overflow-hidden bg-[#0a0a12]/92 backdrop-blur-2xl border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.9)]">

            {/* Preview image area */}
            <div className="relative aspect-video overflow-hidden">
              <motion.img
                key={game.id}
                src={game.thumbnail}
                alt={game.title}
                className="w-full h-full object-cover"
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 4, ease: "easeOut" }}
              />

              {/* Scanline effect */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{
                  backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)",
                }}
              />

              {/* Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-neon-purple/10" />

              {/* LIVE PREVIEW badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-red-500/30">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-red-500"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-[0.15em]">Preview</span>
              </div>

              {/* Rating badge top-right */}
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-yellow-500/20">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-[11px] font-bold text-white">{game.rating}</span>
              </div>

              {/* Animated progress bar (simulates loading/playing) */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-electric-blue to-neon-purple"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>

            {/* Info section */}
            <div className="p-5">
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-electric-blue/70 border border-electric-blue/15 rounded-md bg-electric-blue/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title + description */}
              <h3 className="text-[18px] font-bold text-white mb-1 leading-tight">{game.title}</h3>
              <p className="text-[12px] text-white/45 leading-relaxed mb-4 line-clamp-2">{game.description}</p>

              {/* Stats row */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/[0.05]">
                <div className="flex items-center gap-1.5 text-[12px] text-white/50">
                  <Users className="w-3.5 h-3.5 text-neon-cyan" />
                  <span className="font-semibold text-white/70">{game.plays}</span>
                  <span>plays</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-white/50">
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Browser</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-white/50">
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span className="text-white/40">{game.developer}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 bg-gradient-to-r from-electric-blue to-neon-cyan text-black font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_30px_rgba(0,240,255,0.45)] transition-shadow">
                  <Play className="w-4 h-4 fill-black" />
                  Play Now — Free
                </button>
                <button className="px-3.5 py-2.5 bg-white/5 border border-white/10 text-white/60 text-sm rounded-xl hover:bg-white/10 transition-colors">
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="px-3.5 py-2.5 bg-white/5 border border-white/10 text-white/60 text-sm rounded-xl hover:bg-white/10 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
