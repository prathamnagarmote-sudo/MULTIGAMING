"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, User, X, 
  Sword, Car, Puzzle as PuzzleIcon, Target, Compass, Activity, Shield, Globe, Building
} from "lucide-react";

const CATEGORIES = [
  { id: "action", name: "Action", icon: Sword, count: 120 },
  { id: "racing", name: "Racing", icon: Car, count: 85 },
  { id: "puzzle", name: "Puzzle", icon: PuzzleIcon, count: 200 },
  { id: "shooting", name: "Shooting", icon: Target, count: 95 },
  { id: "adventure", name: "Adventure", icon: Compass, count: 150 },
  { id: "sports", name: "Sports", icon: Activity, count: 60 },
  { id: "strategy", name: "Strategy", icon: Shield, count: 110 },
  { id: "multiplayer", name: "Multiplayer", icon: Globe, count: 45 },
  { id: "simulation", name: "Simulation", icon: Building, count: 55 }
];

import { UserSession } from "@/components/user/UserDashboard";

interface SidebarProps {
  currentView: "home" | "play" | "dashboard" | "login";
  currentUser: UserSession | null;
  isSidebarVisible?: boolean;
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
  onChangeView: (view: "home" | "play" | "dashboard" | "login") => void;
}

export function Sidebar({ currentView, currentUser, isSidebarVisible = true, isMobileMenuOpen, onCloseMobileMenu, onChangeView }: SidebarProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleCategoryClick = (catId: string) => {
    setActiveCategory(catId === activeCategory ? null : catId);
    onChangeView("home");
    // Scroll to the category element if it exists on home page
    setTimeout(() => {
      const el = document.getElementById(`${catId}-games` || catId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  const isExpanded = isHovered || isMobileMenuOpen;

  return (
    <>
      {/* Premium Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-45 md:hidden" 
            onClick={onCloseMobileMenu}
          />
        )}
      </AnimatePresence>
      
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 bottom-0 bg-[#0a0a0f] z-50 flex flex-col overflow-hidden transition-all duration-300 ease-[0.16,1,0.3,1] shadow-[10px_0_40px_rgba(0,0,0,0.6)] transform border-r border-white/[0.06] ${
          isMobileMenuOpen 
            ? "top-0 translate-x-0 w-[270px] opacity-100" 
            : "top-14 -translate-x-full w-[270px] opacity-0 pointer-events-none md:pointer-events-auto"
        } ${
          isSidebarVisible
            ? "md:translate-x-0 md:opacity-100 md:top-16"
            : "md:-translate-x-full md:w-0 md:opacity-0 md:pointer-events-none"
        } ${
          isExpanded && isSidebarVisible ? "md:w-[240px]" : "md:w-[72px]"
        }`}
      >
        {/* Sidebar Header Spacer - Matches TopBar height exactly for clean lines. Contains Close button on mobile. No duplicate branding. */}
        {isMobileMenuOpen && (
          <div className="h-14 md:h-16 flex items-center justify-between border-b border-white/[0.06] transition-all duration-300 shrink-0 px-5">
            <span className="text-xs font-bold uppercase tracking-wider text-white/30 font-mono">Navigation</span>
            <button 
              onClick={onCloseMobileMenu}
              className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 border border-white/[0.08] transition-all"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Navigation Links */}
        <div className={`px-2 py-4 flex flex-col gap-1.5 border-b border-white/[0.06] transition-all duration-300 ${
          isExpanded && isSidebarVisible ? "px-3" : "px-1.5"
        }`}>
          <button
            onClick={() => {
              onChangeView("home");
              setActiveCategory(null);
              if (onCloseMobileMenu) onCloseMobileMenu();
            }}
            className={`w-full flex items-center rounded-xl text-left transition-all duration-200 group relative overflow-hidden ${
              isExpanded && isSidebarVisible ? "px-3 py-2.5 gap-3" : "p-2.5 justify-center"
            } ${
              currentView === "home"
                ? "bg-electric-blue/10 text-white border border-electric-blue/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]"
                : "text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent"
            }`}
            title="Arcade Lobby"
          >
            <Home className={`w-4.5 h-4.5 shrink-0 transition-colors ${currentView === "home" ? "text-electric-blue" : "text-white/40 group-hover:text-white"}`} />
            
            {isExpanded && isSidebarVisible && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs font-bold uppercase tracking-wider whitespace-nowrap"
              >
                Arcade Lobby
              </motion.span>
            )}

            {currentView === "home" && isExpanded && isSidebarVisible && (
              <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-electric-blue shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            )}
          </button>


        </div>

        {/* Categories Section */}
        <div className={`flex-1 overflow-y-auto py-3 custom-scrollbar transition-all duration-300 ${
          isExpanded && isSidebarVisible ? "px-3" : "px-1.5"
        }`}>
          {isExpanded && isSidebarVisible && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-3 pb-2 flex items-center justify-between"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Categories</span>
              {activeCategory && (
                <button 
                  onClick={() => setActiveCategory(null)}
                  className="text-[9px] font-bold uppercase tracking-wider text-electric-blue hover:underline"
                >
                  Clear
                </button>
              )}
            </motion.div>
          )}

          <div className="flex flex-col gap-1">
            {CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`w-full flex items-center rounded-xl text-left transition-all duration-200 group relative overflow-hidden ${
                    isExpanded && isSidebarVisible ? "px-3 py-2.5 gap-3" : "p-2.5 justify-center"
                  } ${
                    activeCategory === cat.id
                      ? "bg-electric-blue/10 text-white border border-electric-blue/20"
                      : "text-white/50 hover:text-white/90 hover:bg-white/[0.03] border border-transparent"
                  }`}
                  title={cat.name}
                >
                  {/* Active indicator bar */}
                  {activeCategory === cat.id && (
                    <motion.div
                      layoutId="activeCatIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-electric-blue rounded-r-full shadow-[0_0_10px_rgba(0,240,255,0.8)]"
                    />
                  )}

                  <IconComponent className="w-4.5 h-4.5 shrink-0 text-white/40 group-hover:text-white transition-colors group-hover:scale-110 transition-transform duration-200" />
                  
                  {isExpanded && isSidebarVisible && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex-1 text-sm font-medium whitespace-nowrap text-white/70 group-hover:text-white transition-colors"
                    >
                      {cat.name}
                    </motion.span>
                  )}

                  {isExpanded && isSidebarVisible && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-[11px] font-medium whitespace-nowrap px-1.5 py-0.5 rounded-md bg-white/[0.04] group-hover:bg-white/[0.08] transition-colors ${
                        activeCategory === cat.id ? "text-electric-blue font-bold" : "text-white/35"
                      }`}
                    >
                      {cat.count}
                    </motion.span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}

