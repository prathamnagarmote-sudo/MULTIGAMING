"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ArrowRight, Gamepad2, X, AlertCircle } from "lucide-react";

import { UserSession } from "@/components/user/UserDashboard";

interface LoginViewProps {
  onBackToHome: () => void;
  onLoginSuccess: (user: UserSession) => void;
}

export function LoginView({ onBackToHome, onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate network delay for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Secret Admin Routing Mechanism
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@zylogames.com";
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "supersecret";

    if (email === adminEmail && password === adminPassword) {
      onLoginSuccess({ role: "admin", name: "Admin" }); // Route to Admin Dashboard secretly
    } else {
      // Normal User Mock Flow
      if (email.includes("@") && password.length >= 6) {
        // Extract display name from email (e.g. pratham@gmail.com -> Pratham)
        const namePart = email.split("@")[0];
        const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        
        onLoginSuccess({ role: "player", name: displayName }); 
      } else {
        setError("Invalid credentials. Please check your email and password.");
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Blur Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#0c0c14]/80 backdrop-blur-md"
        onClick={onBackToHome}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-[#12121a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden p-8"
      >
        {/* Close Button */}
        <button
          onClick={onBackToHome}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] mb-4">
            <Gamepad2 className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-heading font-black tracking-wider uppercase text-white">
            Welcome Back
          </h2>
          <p className="text-sm text-white/50 mt-2 text-center">
            Log in to save progress, compete on leaderboards, and unlock achievements.
          </p>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-xs text-red-400 font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="player@zylogames.com"
                className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-electric-blue/50 focus:bg-white/[0.05] rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1 flex justify-between">
              <span>Password</span>
              <a href="#" className="text-electric-blue hover:text-neon-cyan transition-colors">
                Forgot?
              </a>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-electric-blue/50 focus:bg-white/[0.05] rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-black tracking-widest uppercase hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In To Arcade
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/[0.05] flex flex-col items-center gap-3">
          <p className="text-xs text-white/40">Don't have an account?</p>
          <button className="text-sm font-bold text-white/70 hover:text-white transition-colors">
            Create Free Account
          </button>
        </div>
      </motion.div>
    </div>
  );
}
