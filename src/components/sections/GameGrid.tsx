"use client";

import { useState } from "react";
import { GameTile } from "@/components/ui/GameTile";
import { GameData } from "@/utils/db";
import { ChevronRight, ChevronDown, Grid3x3 } from "lucide-react";

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

  // Show 8 on desktop (2 rows of 4), all when expanded
  const displayedGames = isExpanded ? games : games.slice(0, 8);
  const hasMore = games.length > 8;

  if (games.length === 0) return null;

  return (
    <section className="mb-8 bg-[#0b0b12]/40 backdrop-blur-md border border-white/[0.05] p-4 sm:p-6 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] hover:border-white/[0.08] hover:shadow-[0_12px_45px_rgba(0,0,0,0.6)] transition-all duration-300">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
              <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[10px] font-bold text-white/40 font-mono">
                <Grid3x3 className="w-2.5 h-2.5" />
                {games.length}
              </span>
            </div>
            {subtitle && <p className="text-xs sm:text-sm text-white/50 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {showViewAll && hasMore && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white/60 bg-white/[0.04] border border-white/[0.08] hover:text-electric-blue hover:bg-electric-blue/10 hover:border-electric-blue/20 transition-all duration-200 group"
          >
            {isExpanded ? (
              <>
                Show Less
                <ChevronDown className="w-3.5 h-3.5 rotate-180 transition-transform" />
              </>
            ) : (
              <>
                View All ({games.length})
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Game Grid — 2 cols mobile, 3 tablet, 4 desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
