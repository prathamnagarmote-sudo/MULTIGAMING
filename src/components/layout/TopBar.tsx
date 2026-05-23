"use client";

import { Search, Bell, User, ChevronDown } from "lucide-react";
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
      className="sticky top-0 z-50 h-16 bg-[#030303]/60 backdrop-blur-2xl border-b border-white/[0.06] flex items-center justify-between px-6"
    >
      {/* Left: Tabs */}
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-1">
          {["Home", "New", "Trending", "Updated", "Originals"].map((tab, i) => {
            const isTabActive = (tab === "Home" && currentView === "home");
            return (
              <button
                key={tab}
                onClick={() => {
                  if (tab === "Home") onNavigate("home");
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  isTabActive
                    ? "bg-electric-blue/10 text-electric-blue border border-electric-blue/20"
                    : "text-white/65 hover:text-white/95 hover:bg-white/[0.05]"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </nav>

        {/* Live badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">14.2K Online</span>
        </div>
      </div>

      {/* Center: Brand Tagline Status Panel */}
      <div className="hidden xl:flex items-center gap-1.5 font-heading font-black text-sm uppercase tracking-wider text-white border-x border-white/10 px-6 h-8 select-none">
        Play{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-neon-cyan">
          Anything
        </span>
        ,{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink">
          Anywhere
        </span>
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative group">
          <Search className="w-4 h-4 text-white/45 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-electric-blue transition-colors" />
          <input
            type="text"
            placeholder="Search game & categories"
            className="w-64 bg-white/[0.05] border border-white/[0.12] rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/45 focus:outline-none focus:border-electric-blue/30 focus:bg-white/[0.07] focus:w-80 transition-all duration-300"
          />
        </div>

        {/* Notification */}
        <button className="relative w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.12] flex items-center justify-center text-white/65 hover:text-white/95 hover:bg-white/[0.08] transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-electric-blue rounded-full shadow-[0_0_8px_rgba(255,0,85,0.6)]" />
        </button>

        {/* User - Toggles Admin */}
        <button
          onClick={() => onNavigate(currentView === "admin" ? "home" : "admin")}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.12] hover:bg-white/[0.08] transition-all group"
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

