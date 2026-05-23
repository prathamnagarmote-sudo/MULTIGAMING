"use client";

import { Search, Bell, User, ChevronDown, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";

interface TopBarProps {
  currentView: "home" | "play" | "admin";
  onNavigate: (view: "home" | "play" | "admin") => void;
}

export function TopBar({ currentView, onNavigate }: TopBarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 h-14 md:h-16 bg-[#030303]/60 backdrop-blur-2xl border-b border-white/[0.06] flex items-center justify-between px-3 md:px-6"
    >
      {/* Left: Mobile Logo */}
      <div className="flex items-center gap-3">
        {/* Mobile-only logo (sidebar is hidden on mobile) */}
        <button
          onClick={() => onNavigate("home")}
          className="md:hidden flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Gamepad2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-heading font-black text-white tracking-wider uppercase">
            Zylo
          </span>
        </button>
      </div>

      {/* Center: Brand Tagline & Live Badge */}
      <div className="hidden xl:flex items-center gap-1.5 font-heading font-black text-sm uppercase tracking-wider text-white border-x border-white/10 px-6 h-8 select-none">
        {/* Live badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mr-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">14.2K Online</span>
        </div>
        Play{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-neon-cyan">
          Anything
        </span>
        ,{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink">
          Anywhere
        </span>
        ,{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
          Anytime
        </span>
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search - full on desktop, icon-only on mobile */}
        <div className="relative group hidden sm:block">
          <Search className="w-4 h-4 text-white/45 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-electric-blue transition-colors" />
          <input
            type="text"
            placeholder="Search game & categories"
            className="w-48 md:w-64 bg-white/[0.05] border border-white/[0.12] rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/45 focus:outline-none focus:border-electric-blue/30 focus:bg-white/[0.07] focus:w-60 md:focus:w-80 transition-all duration-300"
          />
        </div>
        {/* Mobile search icon */}
        <button className="sm:hidden w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.12] flex items-center justify-center text-white/65 hover:text-white/95 hover:bg-white/[0.08] transition-all">
          <Search className="w-4 h-4" />
        </button>

        {/* Notification */}
        <button className="relative w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.12] flex items-center justify-center text-white/65 hover:text-white/95 hover:bg-white/[0.08] transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-electric-blue rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
        </button>

        {/* User - Toggles Admin (hidden on mobile, accessible via bottom nav) */}
        <button
          onClick={() => onNavigate(currentView === "admin" ? "home" : "admin")}
          className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.12] hover:bg-white/[0.08] transition-all group"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-white/85 group-hover:text-white transition-colors">
            {currentView === "admin" ? "Admin Mode" : "Developer"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-white/55" />
        </button>
      </div>
    </motion.header>
  );
}

