"use client";

import { useState } from "react";
import { GameTile } from "@/components/ui/GameTile";
import { GameData } from "@/utils/db";
import { ChevronRight } from "lucide-react";

interface GameGridProps {
  title: string;
  subtitle?: string;
  games: GameData[];
  icon?: string;
  showViewAll?: boolean;
  onSelectGame?: (id: string) => void;
}

export function GameGrid({ title, subtitle, games, icon, showViewAll = true, onSelectGame }: GameGridProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedGames = isExpanded ? games : games.slice(0, 6);
  const hasMore = games.length > 6;

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-sm text-white/70 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {showViewAll && hasMore && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm font-medium text-white/70 hover:text-electric-blue transition-colors group"
          >
            {isExpanded ? "Show Less" : "View All"}
            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : "group-hover:translate-x-0.5"}`} />
          </button>
        )}
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {displayedGames.map((game, i) => (
          <GameTile
            key={game.id}
            game={game}
            index={i}
            onClick={() => onSelectGame?.(game.id)}
          />
        ))}
      </div>
    </section>
  );
}

