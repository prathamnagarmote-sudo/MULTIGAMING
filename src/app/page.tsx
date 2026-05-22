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

  return (
    <>
      {/* Cinematic loading sequence */}
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {/* Plain dark background replacement for 3D world */}
      <div className="fixed inset-0 bg-[#0a0a0a] -z-10" />

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
                <HeroBanner onPlayGame={handleSelectGame} />

                {/* Game sections */}
                <GameGrid
                  title="🔥 Hot Right Now"
                  subtitle="Most played games this week across the platform"
                  games={hotGames}
                  showViewAll
                  onSelectGame={handleSelectGame}
                />

                <GameGrid
                  title="✨ New Releases"
                  subtitle="Fresh drops — added in the last 7 days"
                  games={newGames}
                  showViewAll
                  onSelectGame={handleSelectGame}
                />

                {/* Animated platform stats */}
                <StatsBar />

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

