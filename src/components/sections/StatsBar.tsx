"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface StatProps {
  value: number;
  suffix: string;
  label: string;
  color: string;
}

function AnimatedStat({ value, suffix, label, color }: StatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className={`text-4xl font-heading font-black ${color}`}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-white/30 mt-1 uppercase tracking-wider font-medium">{label}</div>
    </motion.div>
  );
}

export function StatsBar() {
  return (
    <section className="rounded-2xl bg-black/30 backdrop-blur-xl border border-white/[0.06] p-8 mb-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <AnimatedStat value={2847} suffix="+" label="Games Available" color="text-electric-blue" />
        <AnimatedStat value={14} suffix="M+" label="Monthly Players" color="text-neon-purple" />
        <AnimatedStat value={98} suffix="%" label="Uptime" color="text-emerald-400" />
        <AnimatedStat value={500} suffix="K+" label="Daily Matches" color="text-yellow-400" />
      </div>
    </section>
  );
}
