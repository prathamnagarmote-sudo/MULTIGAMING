"use client";

import { Search, Bell, User, ChevronDown, Gamepad2, ArrowLeft, Menu, AlignLeft } from "lucide-react";
import { motion } from "framer-motion";

import { UserSession } from "@/components/user/UserDashboard";

interface TopBarProps {
  currentView: "home" | "play" | "dashboard" | "login";
  currentUser: UserSession | null;
  isSidebarVisible?: boolean;
  onToggleMobileMenu?: () => void;
  onNavigate: (view: "home" | "play" | "dashboard" | "login") => void;
}

export function TopBar({ currentView, currentUser, isSidebarVisible = true, onToggleMobileMenu, onNavigate }: TopBarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 h-14 md:h-16 bg-[#0a0a0f]/85 backdrop-blur-2xl border-b border-white/[0.06] flex items-center justify-between px-3 md:px-6"
    >
      {/* Left: Branding & Hamburger Toggle (Visible on Desktop & Mobile) */}
      <div className="flex items-center gap-3.5 shrink-0">
        {currentView === "play" && (
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.10] text-white/70 hover:text-white hover:bg-white/[0.08] transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}
        <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={onToggleMobileMenu}
              className="p-1.5 md:p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer flex items-center justify-center relative group"
              aria-label="Toggle Navigation Sidebar"
            >
              {isSidebarVisible ? (
                <Menu className="w-5 h-5 transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <AlignLeft className="w-5 h-5 text-electric-blue transition-transform duration-300 group-hover:scale-105 animate-pulse" />
              )}
              {!isSidebarVisible && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-electric-blue shadow-[0_0_8px_rgba(0,240,255,0.8)] animate-bounce" />
              )}
            </button>
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2.5 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <div className="w-8 h-8 rounded-none bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)] shrink-0">
              <Gamepad2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm sm:text-base font-heading font-black text-white tracking-wider uppercase">
              Zylo
            </span>
          </button>
        </div>
      </div>

      {/* Center: Live Badge — hidden on mobile to prevent collision */}
      <div className="hidden lg:flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
        {/* Live player count */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/8 border border-emerald-500/15">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400/90 uppercase tracking-wider font-mono">14.2K Online</span>
        </div>

        {/* Separator */}
        <div className="w-px h-4 bg-white/[0.08]" />

        {/* Tagline */}
        <div className="flex items-center gap-1.5 font-heading font-black text-xs uppercase tracking-wider text-white/80 select-none">
          Play{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-neon-cyan">
            Anything
          </span>
          ,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink">
            Anywhere
          </span>
        </div>
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search - full on desktop, icon-only on mobile */}
        <div className="relative group hidden sm:block">
          <Search className="w-4 h-4 text-white/45 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-electric-blue transition-colors" />
          <input
            type="text"
            placeholder="Search games & categories..."
            className="w-56 md:w-72 lg:w-80 bg-white/[0.05] border border-white/[0.10] rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-electric-blue/30 focus:bg-white/[0.07] focus:w-64 md:focus:w-80 lg:focus:w-96 transition-all duration-300"
          />
        </div>
        {/* Mobile search icon */}
        <button className="sm:hidden w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.10] flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/[0.08] transition-all">
          <Search className="w-4 h-4" />
        </button>

        {/* Notification */}
        <button className="relative w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.10] flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/[0.08] transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-electric-blue rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
        </button>

        {/* User - Login / Sign Up / Dashboard */}
        <button
          onClick={() => onNavigate(currentUser ? "dashboard" : "login")}
          className="flex items-center gap-2 sm:pl-2 sm:pr-3 p-1 sm:py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.10] hover:bg-white/[0.08] transition-all group"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="hidden sm:block text-sm font-medium text-white/75 group-hover:text-white transition-colors pr-1">
            {currentUser ? (currentUser.role === "admin" ? "Admin" : currentUser.name) : "Login"}
          </span>
        </button>
      </div>
    </motion.header>
  );
}
