"use client";

import { motion } from "framer-motion";
import { User, LogOut, Award, Trophy, Gamepad2, Settings, History } from "lucide-react";

export interface UserSession {
  name: string;
  role: "admin" | "player";
}

interface UserDashboardProps {
  user: UserSession;
  onLogout: () => void;
  onBackToHome: () => void;
}

export function UserDashboard({ user, onLogout, onBackToHome }: UserDashboardProps) {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 animate-fade-in">
      {/* Dashboard Header Profile Section */}
      <div className="w-full relative overflow-hidden rounded-3xl bg-[#0a0a0f] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center md:items-stretch group">
        
        {/* Dynamic Abstract Background inside Header */}
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 via-electric-blue/10 to-transparent opacity-50 z-0 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-neon-purple/30 rounded-full blur-[80px] pointer-events-none group-hover:bg-neon-purple/40 transition-all duration-700" />
        
        <div className="relative z-10 p-8 flex-1 flex flex-col md:flex-row items-center md:items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-electric-blue to-neon-purple p-1 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <div className="w-full h-full rounded-full bg-[#12121a] flex items-center justify-center relative overflow-hidden">
              <User className="w-10 h-10 text-white/50" />
            </div>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-xs font-bold text-electric-blue uppercase tracking-widest font-mono mb-1">
              {user.role === "admin" ? "Platform Administrator" : "Zylo Player"}
            </span>
            <h1 className="text-3xl md:text-4xl font-heading font-black text-white uppercase tracking-wider">
              {user.name}
            </h1>
            <p className="text-sm text-white/40 mt-1 font-mono">
              Member since May 2026
            </p>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="relative z-10 p-6 md:p-8 flex items-center justify-center bg-white/[0.02] border-t md:border-t-0 md:border-l border-white/[0.05] min-w-[200px]">
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 transition-all font-bold text-sm tracking-wider uppercase group shadow-[0_0_15px_rgba(239,68,68,0.1)]"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Stats & Games Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Player Stats Overview */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="rounded-3xl bg-[#0a0a0f] border border-white/10 p-6 shadow-xl flex flex-col gap-5">
            <h3 className="text-sm font-heading font-black uppercase text-white/60 tracking-widest flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Achievements
            </h3>
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Gamepad2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm">Games Played</span>
                  <span className="text-white/40 text-[10px] font-mono uppercase">Total Lifetime</span>
                </div>
              </div>
              <span className="text-xl font-black text-emerald-400 font-mono">12</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm">High Scores</span>
                  <span className="text-white/40 text-[10px] font-mono uppercase">Leaderboards</span>
                </div>
              </div>
              <span className="text-xl font-black text-amber-400 font-mono">3</span>
            </div>
          </div>
        </div>

        {/* Right Column: Recently Played */}
        <div className="lg:col-span-2 rounded-3xl bg-[#0a0a0f] border border-white/10 p-6 md:p-8 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-heading font-black uppercase text-white tracking-widest flex items-center gap-2">
              <History className="w-5 h-5 text-neon-purple" />
              Recently Played
            </h3>
            <button onClick={onBackToHome} className="text-xs font-bold text-electric-blue hover:text-white uppercase tracking-wider transition-colors font-mono">
              Browse Games
            </button>
          </div>
          
          {/* Empty State for mock */}
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/20">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <h4 className="text-white font-bold mb-2 uppercase tracking-wide">No Game History Yet</h4>
            <p className="text-sm text-white/40 max-w-sm font-mono leading-relaxed">
              When you play games on Zylo, they will automatically appear here so you can quickly jump back into the action.
            </p>
            <button
              onClick={onBackToHome}
              className="mt-6 px-6 py-2.5 rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors border border-white/10 text-xs font-bold uppercase tracking-widest"
            >
              Start Playing Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
