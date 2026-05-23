"use client";

import { useState, useEffect } from "react";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { GameGrid } from "@/components/sections/GameGrid";
import { StatsBar } from "@/components/sections/StatsBar";
import { GamePlayView } from "@/components/gameplay/GamePlayView";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { GameData, getGamesDB } from "@/utils/db";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [games, setGames] = useState<GameData[]>([]);
  const [activeView, setActiveView] = useState<"home" | "play" | "admin">("home");
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  // Safely seed and load localStorage database on mount (client-side only)
  useEffect(() => {
    setGames(getGamesDB());
  }, []);

  const refreshGames = () => {
    setGames(getGamesDB());
  };

  const handleSelectGame = (id: string) => {
    setActiveGameId(id);
    setActiveView("play");
    refreshGames();
  };

  const handleBackToHome = () => {
    setActiveView("home");
    setActiveGameId(null);
    refreshGames();
  };

  const handleOpenAdmin = () => {
    setActiveView("admin");
    setActiveGameId(null);
    refreshGames();
  };

  const hotGames = games.filter((g) => g.isHot);
  const newGames = games.filter((g) => g.isNew);

  // High-Octane Category Filters
  const boardGames = games.filter(
    (g) =>
      g.genre.toLowerCase() === "puzzle" ||
      g.genre.toLowerCase() === "strategy" ||
      g.tags.some((t) => t.toLowerCase().includes("board") || t.toLowerCase().includes("puzzle"))
  );

  const shootingGames = games.filter(
    (g) =>
      g.genre.toLowerCase() === "shooting" ||
      g.tags.some((t) => t.toLowerCase().includes("shooting") || t.toLowerCase().includes("fps"))
  );

  const racingGames = games.filter(
    (g) =>
      g.genre.toLowerCase() === "racing" ||
      g.genre.toLowerCase() === "driving" ||
      g.tags.some((t) => t.toLowerCase().includes("racing") || t.toLowerCase().includes("drift") || t.toLowerCase().includes("driving"))
  );

  const arcadeGames = games.filter(
    (g) =>
      g.genre.toLowerCase() === "arcade" ||
      g.genre.toLowerCase() === "io" ||
      g.genre.toLowerCase() === "clicker" ||
      g.tags.some((t) => t.toLowerCase().includes("arcade") || t.toLowerCase().includes("casual"))
  );

  const handleExploreCategory = (categoryId: string) => {
    const el = document.getElementById(categoryId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* Cinematic loading sequence */}
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {/* Plain dark background replacement for 3D world */}
      <div className="fixed inset-0 bg-[#08080c] -z-10" />

      {/* Main App Shell */}
      <div
        className={`relative w-full min-h-screen transition-opacity duration-1000 ${
          isLoading ? "opacity-0 overflow-hidden h-screen" : "opacity-100"
        }`}
      >
        {/* Left sidebar */}
        <Sidebar
          currentView={activeView}
          onChangeView={(view) => {
            setActiveView(view);
            setActiveGameId(null);
            refreshGames();
          }}
        />

        {/* Content offset by sidebar */}
        <div className="pl-[240px] min-h-screen flex flex-col">
          {/* Sticky top bar */}
          <TopBar
            currentView={activeView}
            onNavigate={(view) => {
              setActiveView(view);
              setActiveGameId(null);
              refreshGames();
            }}
          />

          {/* Page content */}
          <main className="px-6 pt-6 pb-20 flex-1">
            {activeView === "home" && (
              <>
                {/* Featured hero banner */}
                <HeroBanner onPlayGame={handleSelectGame} onExploreCategory={handleExploreCategory} />

                {/* Game sections */}
                <GameGrid
                  title="🔥 Hot Right Now"
                  subtitle="Most played games this week across the platform"
                  games={hotGames}
                  showViewAll
                  onSelectGame={handleSelectGame}
                />

                <div id="board-games" className="scroll-mt-20">
                  <GameGrid
                    title="🧩 Board Games Universe"
                    subtitle="Explore mind strategy, chess, and tactical logic boards"
                    games={boardGames}
                    showViewAll
                    onSelectGame={handleSelectGame}
                  />
                </div>

                <div id="shooting-games" className="scroll-mt-20">
                  <GameGrid
                    title="🎯 Shooting Games Arena"
                    subtitle="FPS battles, sci-fi gunplay, and action blockbusters"
                    games={shootingGames}
                    showViewAll
                    onSelectGame={handleSelectGame}
                  />
                </div>

                {/* Animated platform stats */}
                <StatsBar />

                <div id="racing-games" className="scroll-mt-20">
                  <GameGrid
                    title="🏎️ Racing & Driving Collection"
                    subtitle="High-octane speeds, drifting asphalt, and rally trials"
                    games={racingGames}
                    showViewAll
                    onSelectGame={handleSelectGame}
                  />
                </div>

                <div id="arcade-games" className="scroll-mt-20">
                  <GameGrid
                    title="🕹️ Arcade & Casual Games World"
                    subtitle="Retro pixels, instant .io hits, and satisfying casual clicks"
                    games={arcadeGames}
                    showViewAll
                    onSelectGame={handleSelectGame}
                  />
                </div>

                <GameGrid
                  title="🎮 Browse All Games"
                  subtitle="The full ZyloGames library — free to play, instantly"
                  games={games}
                  showViewAll
                  onSelectGame={handleSelectGame}
                />

                <Footer />
              </>
            )}

            {activeView === "play" && activeGameId && (
              <GamePlayView
                gameId={activeGameId}
                onBackToHome={handleBackToHome}
                onSelectGame={handleSelectGame}
              />
            )}

            {activeView === "admin" && (
              <AdminDashboard onBackToHome={handleBackToHome} />
            )}
          </main>
        </div>
      </div>
    </>
  );
}

