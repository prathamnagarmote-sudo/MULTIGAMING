"use client";

import { motion } from "framer-motion";

// A floating "ZyloGames" section header that appears at the top of the content
// to reinforce the brand over the visible 3D background
export function BrandHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative mb-8 rounded-2xl overflow-hidden border border-white/[0.05] bg-black/20 backdrop-blur-sm px-8 py-6"
    >
      {/* Ambient background lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Glow left */}
      <motion.div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-32 bg-electric-blue/10 blur-[60px] rounded-full"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Glow right */}
      <motion.div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-32 bg-neon-purple/10 blur-[60px] rounded-full"
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <span className="text-sm font-heading font-black text-white">Z</span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/30">ZyloGames Platform</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-black text-white tracking-tight">
            Play{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-neon-cyan">
              Anything
            </span>
            ,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink">
              Anywhere
            </span>
          </h2>
          <p className="text-sm text-white/35 mt-1">2,847 free games · No download · No login required</p>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {[
            { val: "2.8K+", label: "Games" },
            { val: "14M", label: "Players" },
            { val: "Free", label: "Always" },
          ].map((s) => (
            <div key={s.label} className="text-center px-5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <div className="text-lg font-heading font-black text-electric-blue">{s.val}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
