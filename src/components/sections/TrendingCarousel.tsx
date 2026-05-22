"use client";

import { useRef, useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { Game } from "@/components/ui/GameCard";
import { Play } from "lucide-react";

const TRENDING_GAMES: Game[] = [
  {
    id: "t1",
    title: "Apex Nexus",
    genre: ["Battle Royale", "FPS"],
    rating: 4.7,
    players: "1.2M",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "t2",
    title: "Void Walkers",
    genre: ["Horror", "Co-op"],
    rating: 4.8,
    players: "150K",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop",
  },
  {
    id: "t3",
    title: "Chrono Blade",
    genre: ["Action RPG", "Hack & Slash"],
    rating: 4.5,
    players: "80K",
    image: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=2019&auto=format&fit=crop",
  },
  {
    id: "t4",
    title: "Quantum League",
    genre: ["Sports", "Esports"],
    rating: 4.6,
    players: "500K",
    image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "t5",
    title: "Mech Storm",
    genre: ["Strategy", "Mecha"],
    rating: 4.4,
    players: "30K",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop",
  }
];

// Duplicate for infinite scroll
const CAROUSEL_ITEMS = [...TRENDING_GAMES, ...TRENDING_GAMES];

export function TrendingCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef);
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start({
        x: ["0%", "-50%"],
        transition: {
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        },
      });
    } else {
      controls.stop();
    }
  }, [isInView, controls]);

  return (
    <section className="py-20 relative z-20 overflow-hidden bg-black/50 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <h2 className="text-3xl md:text-4xl font-heading font-black text-white uppercase tracking-wide flex items-center gap-4">
          <span className="w-3 h-3 bg-neon-pink rounded-full box-glow-purple animate-pulse" />
          Trending Now
        </h2>
      </div>

      <div ref={containerRef} className="w-full cursor-grab active:cursor-grabbing">
        <motion.div 
          className="flex gap-6 w-max px-6"
          animate={controls}
        >
          {CAROUSEL_ITEMS.map((game, i) => (
            <div 
              key={`${game.id}-${i}`} 
              className="relative w-[300px] md:w-[450px] aspect-video rounded-xl overflow-hidden group shrink-0"
            >
              <img 
                src={game.image} 
                alt={game.title}
                className="w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-neon-purple/50 rounded-xl transition-colors duration-500 z-20 pointer-events-none" />

              <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-2xl font-heading font-bold text-white uppercase tracking-wider mb-2">
                    {game.title}
                  </h3>
                  <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    <span className="text-sm text-electric-blue font-bold">{game.players} Players</span>
                    <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-electric-blue transition-colors">
                      <Play className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
