"use client";

import { useState, useEffect } from "react";
import { Home as HomeIcon, Settings, User } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { GameGrid } from "@/components/sections/GameGrid";
import { StatsBar } from "@/components/sections/StatsBar";
import { GamePlayView } from "@/components/gameplay/GamePlayView";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { LoginView } from "@/components/auth/LoginView";
import { UserDashboard, UserSession } from "@/components/user/UserDashboard";
import { GameData, getGamesDB } from "@/utils/db";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [games, setGames] = useState<GameData[]>([]);
  const [activeView, setActiveView] = useState<"home" | "play" | "dashboard" | "login">("home");
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Safely load database on mount
  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        const data = await getGamesDB();
        setGames(data);
      } catch (err) {
        console.error("Failed to fetch games from Firebase", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGames();

    // Restore view and game states from URL parameters on page refresh
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get("view");
      const gameParam = params.get("game");

      if (viewParam === "dashboard") {
        setActiveView("dashboard");
        setActiveGameId(null);
      } else if (gameParam) {
        setActiveView("play");
        setActiveGameId(gameParam);
      } else if (viewParam === "home") {
        setActiveView("home");
        setActiveGameId(null);
      }
    }

    // Load persisted user session
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("zylo_session");
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem("zylo_session");
        }
      }
    }
  }, []);

  // Persist view and game states to URL query parameters dynamically
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (activeView === "play" && activeGameId) {
        params.set("game", activeGameId);
        params.delete("view");
      } else if (activeView === "dashboard") {
        params.set("view", "dashboard");
        params.delete("game");
      } else {
        params.delete("view");
        params.delete("game");
      }

      const newQuery = params.toString();
      const newUrl = window.location.pathname + (newQuery ? `?${newQuery}` : "");
      window.history.replaceState(null, "", newUrl);
    }
  }, [activeView, activeGameId]);

  const refreshGames = async () => {
    setIsLoading(true);
    try {
      const data = await getGamesDB();
      setGames(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGame = (id: string) => {
    setActiveGameId(id);
    setActiveView("play");
  };

  const handleBackToHome = () => {
    setActiveView("home");
    setActiveGameId(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("zylo_session");
    }
    setActiveView("home");
    setActiveGameId(null);
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
      g.genre.toLowerCase() === "action" ||
      g.tags.some((t) => t.toLowerCase().includes("shooting") || t.toLowerCase().includes("fps") || t.toLowerCase().includes("battle") || t.toLowerCase().includes("gun"))
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
      {/* Plain dark background replacement for 3D world */}
      <div className="fixed inset-0 bg-[#08080c] -z-10" />

      {/* Main App Shell */}
      <div className="relative w-full min-h-screen flex flex-col">
        {/* Global Top Bar - Spans full width at the very top of the viewport */}
        <TopBar
          currentView={activeView}
          currentUser={currentUser}
          isSidebarVisible={isSidebarVisible}
          onToggleMobileMenu={() => {
            if (typeof window !== "undefined" && window.innerWidth >= 768) {
              setIsSidebarVisible(!isSidebarVisible);
            } else {
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }
          }}
          onNavigate={(view) => {
            setActiveView(view);
            setActiveGameId(null);
            setIsMobileMenuOpen(false);
          }}
        />

        {/* Lower layout containing Sidebar and offset Main Content */}
        <div className="flex-1 flex relative pt-0">
          {/* Left sidebar - Positioned below the TopBar */}
          <Sidebar
            currentView={activeView}
            currentUser={currentUser}
            isSidebarVisible={isSidebarVisible}
            isMobileMenuOpen={isMobileMenuOpen}
            onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
            onChangeView={(view) => {
              setActiveView(view);
              setActiveGameId(null);
              setIsMobileMenuOpen(false);
            }}
          />

          {/* Page content offset by sidebar width */}
          <div className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${isSidebarVisible ? "md:pl-[72px]" : "pl-0 md:pl-0"
            }`}>
            {/* Page content */}
            <main className="px-3 sm:px-4 md:px-6 pb-24 md:pb-20 flex-1 pt-0">
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

              {activeView === "dashboard" && currentUser?.role === "admin" && (
                <AdminDashboard onBackToHome={handleBackToHome} onLogout={handleLogout} />
              )}

              {activeView === "dashboard" && currentUser?.role === "player" && (
                <UserDashboard user={currentUser} onLogout={handleLogout} onBackToHome={handleBackToHome} />
              )}

              {activeView === "login" && (
                <LoginView
                  onBackToHome={handleBackToHome}
                  onLoginSuccess={(user) => {
                    setCurrentUser(user);
                    if (typeof window !== "undefined") {
                      localStorage.setItem("zylo_session", JSON.stringify(user));
                    }
                    setActiveView("dashboard");
                  }}
                />
              )}
            </main>
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar — premium glassmorphic design */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom">
          <div className="mx-3 mb-2 flex items-center justify-around rounded-2xl bg-[#0c0c14]/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_-4px_30px_rgba(0,0,0,0.6)] px-1 py-1">
            <button
              onClick={() => {
                setActiveView("home");
                setActiveGameId(null);
              }}
              className={`flex flex-col items-center gap-0.5 py-2 px-5 rounded-xl transition-all duration-200 ${activeView === "home"
                  ? "text-electric-blue bg-electric-blue/10"
                  : "text-white/40 active:text-white/60"
                }`}
            >
              <HomeIcon className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
            </button>

            <button
              onClick={() => {
                setActiveView(currentUser ? "dashboard" : "login");
                setActiveGameId(null);
              }}
              className={`flex flex-col items-center gap-0.5 py-2 px-5 rounded-xl transition-all duration-200 ${activeView === "login" || activeView === "dashboard"
                  ? "text-neon-purple bg-neon-purple/10"
                  : "text-white/40 active:text-white/60"
                }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">
                {currentUser ? (currentUser.role === "admin" ? "Admin" : currentUser.name) : "Login"}
              </span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}

