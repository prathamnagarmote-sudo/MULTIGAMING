"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"logo" | "loading" | "done">("logo");

  useEffect(() => {
    // Show logo for 800ms, then start loading bar
    const logoTimer = setTimeout(() => setPhase("loading"), 800);
    return () => clearTimeout(logoTimer);
  }, []);

  useEffect(() => {
    if (phase !== "loading") return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setPhase("done");
          setTimeout(onComplete, 600);
          return 100;
        }
        return prev + 1.2;
      });
    }, 18);
    return () => clearInterval(interval);
  }, [phase, onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black overflow-hidden"
      >
        {/* Animated radial background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(0,240,255,0.12),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_60%,rgba(184,0,255,0.08),transparent)]" />
        </div>

        {/* Rotating ring */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full border border-electric-blue/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-[380px] h-[380px] rounded-full border border-neon-purple/10"
          animate={{ rotate: -360 }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-[260px] h-[260px] rounded-full border border-electric-blue/15"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />

        {/* Pulsing center glow */}
        <motion.div
          className="absolute w-40 h-40 bg-electric-blue/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center select-none"
        >
          {/* Z icon */}
          <motion.div
            className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center shadow-[0_0_40px_rgba(0,240,255,0.4)]"
            animate={{ boxShadow: ["0 0 40px rgba(0,240,255,0.3)", "0 0 60px rgba(184,0,255,0.4)", "0 0 40px rgba(0,240,255,0.3)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-4xl font-heading font-black text-white">Z</span>
          </motion.div>

          <div className="text-5xl font-heading font-black tracking-[0.08em] uppercase">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue via-neon-cyan to-neon-purple"
              style={{ textShadow: "0 0 30px rgba(0,240,255,0.5)" }}>
              Zylo
            </span>
            <span className="text-white">Games</span>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 text-[11px] tracking-[0.4em] text-white/30 uppercase font-sans"
          >
            Next Generation Gaming
          </motion.p>
        </motion.div>

        {/* Progress section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: phase === "loading" || phase === "done" ? 1 : 0, y: phase !== "logo" ? 0 : 10 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-1/4 w-72 flex flex-col items-center gap-3"
        >
          {/* Progress bar */}
          <div className="w-full h-[2px] bg-white/8 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-electric-blue via-neon-cyan to-neon-purple rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
          {/* Progress text */}
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] tracking-[0.3em] text-white/20 uppercase">Loading</span>
            <span className="text-[10px] font-mono text-electric-blue/60">{Math.floor(Math.min(progress, 100))}%</span>
          </div>
        </motion.div>

        {/* Grid decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]" />
      </motion.div>
    </AnimatePresence>
  );
}
