"use client";

import { GameCard, Game } from "@/components/ui/GameCard";
import { motion } from "framer-motion";

const MOCK_GAMES: Game[] = [
  {
    id: "1",
    title: "Cyberpunk Echoes",
    genre: ["RPG", "Open World"],
    rating: 4.8,
    players: "124K",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
    isLive: true,
  },
  {
    id: "2",
    title: "Neon Drift",
    genre: ["Racing", "Multiplayer"],
    rating: 4.6,
    players: "89K",
    image: "https://images.unsplash.com/photo-1614294149010-950b698f72c0?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "Stellar Frontier",
    genre: ["Sci-Fi", "FPS"],
    rating: 4.9,
    players: "310K",
    image: "https://images.unsplash.com/photo-1614294148960-9aa740632a87?q=80&w=2070&auto=format&fit=crop",
    isLive: true,
  },
  {
    id: "4",
    title: "Shadow Syndicate",
    genre: ["Action", "Stealth"],
    rating: 4.5,
    players: "45K",
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=2070&auto=format&fit=crop",
  }
];

export function FeaturedGames() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto relative z-20">
      <div className="flex justify-between items-end mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-sm font-sans font-bold text-electric-blue tracking-[0.2em] uppercase mb-2">Curated Selection</h2>
          <h3 className="text-4xl md:text-5xl font-heading font-black text-white uppercase tracking-wide">
            Featured Games
          </h3>
        </motion.div>
        <button className="hidden md:block text-sm font-bold text-white/50 hover:text-white uppercase tracking-wider transition-colors border-b border-transparent hover:border-electric-blue pb-1">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_GAMES.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <GameCard game={game} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
