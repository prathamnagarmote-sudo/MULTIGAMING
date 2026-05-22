"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Settings, Home } from "lucide-react";
import { CATEGORIES } from "@/data/mockGames";

interface SidebarProps {
  currentView: "home" | "play" | "admin";
  onChangeView: (view: "home" | "play" | "admin") => void;
}

export function Sidebar({ currentView, onChangeView }: SidebarProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 bottom-0 w-[240px] bg-[#030303]/70 backdrop-blur-2xl border-r border-white/[0.06] z-50 flex flex-col overflow-hidden animate-fade-in"
    >
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)]">
          <Gamepad2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-heading font-black text-white tracking-wider uppercase">
            Zylo
          </span>
          <span className="text-[10px] text-white/30 block -mt-1 tracking-widest uppercase">Gaming Platform</span>
        </div>
      </div>

      {/* Main Core Navigation Links */}
      <div className="px-2 py-4 flex flex-col gap-1.5 border-b border-white/[0.06]">
        <button
          onClick={() => {
            onChangeView("home");
            setActiveCategory(null);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 relative overflow-hidden group ${
            currentView === "home"
              ? "bg-electric-blue/10 text-electric-blue border border-electric-blue/20"
              : "text-white/50 hover:text-white/80 hover:bg-white/[0.03]"
          }`}
        >
          <Home className={`w-4.5 h-4.5 transition-colors ${currentView === "home" ? "text-electric-blue" : "text-white/40"}`} />
          <span className="text-xs font-bold uppercase tracking-wider">Arcade Lobby</span>
        </button>

        <button
          onClick={() => {
            onChangeView("admin");
            setActiveCategory(null);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 relative overflow-hidden group ${
            currentView === "admin"
              ? "bg-neon-purple/10 text-neon-purple border border-neon-purple/20"
              : "text-white/50 hover:text-white/80 hover:bg-white/[0.03]"
          }`}
        >
          <Settings className={`w-4.5 h-4.5 transition-colors ${currentView === "admin" ? "text-neon-purple animate-spin-slow" : "text-white/40"}`} />
          <span className="text-xs font-bold uppercase tracking-wider">Developer Admin</span>
          {currentView === "admin" && (
            <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-neon-purple shadow-[0_0_8px_rgba(184,0,255,0.8)]" />
          )}
        </button>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
        <div className="px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Categories</span>
        </div>

        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id === activeCategory ? null : cat.id);
              onChangeView("home");
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group relative overflow-hidden ${
              activeCategory === cat.id
                ? "bg-electric-blue/10 text-electric-blue"
                : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
            }`}
          >
            {/* Active indicator */}
            {activeCategory === cat.id && (
              <motion.div
                layoutId="activeCat"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-electric-blue rounded-r-full shadow-[0_0_10px_rgba(0,240,255,0.5)]"
              />
            )}

            <span className="text-lg w-7 text-center">{cat.icon}</span>
            <span className="flex-1 text-sm font-medium">{cat.name}</span>
            <span className={`text-[11px] font-medium ${
              activeCategory === cat.id ? "text-electric-blue/60" : "text-white/20"
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>
    </motion.aside>
  );
}

