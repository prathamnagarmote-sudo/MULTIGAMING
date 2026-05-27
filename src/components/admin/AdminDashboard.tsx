"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit2,
  Trophy,
  AlertTriangle,
  FolderOpen,
  Save,
  CheckCircle,
  HelpCircle,
  Video,
  Layers,
  X,
  UploadCloud,
  FileArchive,
  Smartphone,
  Laptop,
  Search,
  Check,
  Activity,
  Star,
  Flame,
  Palette,
  Settings,
  Sparkles,
  Gamepad2,
  TrendingUp,
  Cpu
} from "lucide-react";
import { UploadDropzone } from "@/utils/uploadthing";
import {
  GameData,
  FAQItem,
  GameplayVideo,
  getGamesDB,
  addGameDB,
  updateGameDB,
  deleteGameDB
} from "@/utils/db";

interface AdminDashboardProps {
  onBackToHome: () => void;
  onLogout?: () => void;
}

export function AdminDashboard({ onBackToHome, onLogout }: AdminDashboardProps) {
  const [games, setGames] = useState<GameData[]>([]);
  const [editingGame, setEditingGame] = useState<GameData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Action");
  const [developer, setDeveloper] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [banner, setBanner] = useState("");
  const [portraitBackground, setPortraitBackground] = useState("");
  const [previewVideo, setPreviewVideo] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");
  const [accentColor, setAccentColor] = useState("#00f0ff");
  const [buttonGradient, setButtonGradient] = useState("from-[#00f0ff] to-[#b800ff]");
  const [isNew, setIsNew] = useState(false);
  const [isHot, setIsHot] = useState(false);
  const [isHero, setIsHero] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [plays, setPlays] = useState("100K");
  const [isPortrait, setIsPortrait] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "3:4" | "2:3">("16:9");
  const [activeTab, setActiveTab] = useState<"general" | "media" | "hosting" | "addons">("general");
  const [searchQuery, setSearchQuery] = useState("");

  // ZIP Upload States
  const [isZipGame, setIsZipGame] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [existingZipSize, setExistingZipSize] = useState<string | null>(null);

  // Quick cyber theme presets
  const PRESETS = [
    { name: "Cyan Spark", accent: "#00f0ff", gradient: "from-[#00f0ff] to-[#b800ff]" },
    { name: "Acid Lime", accent: "#10b981", gradient: "from-[#10b981] to-[#059669]" },
    { name: "Solar Gold", accent: "#f59e0b", gradient: "from-[#f59e0b] to-[#d97706]" },
    { name: "Orchid Violet", accent: "#a855f7", gradient: "from-[#a855f7] to-[#ec4899]" },
    { name: "Crimson Blaze", accent: "#ef4444", gradient: "from-[#ef4444] to-[#7f1d1d]" }
  ];

  const handleApplyPreset = (accent: string, gradient: string) => {
    setAccentColor(accent);
    setButtonGradient(gradient);
  };

  // Play count parser to calculate aggregate catalog interactions
  const parsePlays = (playsStr: string): number => {
    if (!playsStr) return 0;
    const clean = playsStr.trim().toUpperCase();
    if (clean.endsWith("M")) {
      return parseFloat(clean.replace("M", "")) * 1000000;
    }
    if (clean.endsWith("K")) {
      return parseFloat(clean.replace("K", "")) * 1000;
    }
    const parsed = parseFloat(clean.replace(/[^0-9.]/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  };

  // Aggregate metrics computations
  const totalPlays = games.reduce((sum, g) => sum + parsePlays(g.plays || "0"), 0);
  const totalGames = games.length;
  const zipGamesCount = games.filter((g) => g.isZipGame).length;
  const zipRatio = totalGames ? Math.round((zipGamesCount / totalGames) * 100) : 0;
  const avgRating = totalGames
    ? parseFloat((games.reduce((sum, g) => sum + (g.rating || 5.0), 0) / totalGames).toFixed(1))
    : 5.0;
  const heroCount = games.filter((g) => g.isHero).length;

  const formatPlays = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(0) + "K";
    return num.toString();
  };

  // Custom arrays
  const [faqs, setFaqs] = useState<FAQItem[]>([
    { question: "Is this game free to play?", answer: "Yes, it is 100% free to play directly in your browser." }
  ]);
  const [gameplayVideos, setGameplayVideos] = useState<GameplayVideo[]>([
    { title: "Official Gameplay Walkthrough", videoUrl: "https://www.youtube.com/embed/n305c4xQ27Y" }
  ]);

  // Load database on start
  useEffect(() => {
    refreshList();
  }, []);

  const refreshList = async () => {
    const data = await getGamesDB();
    setGames(data);
  };

  const handleEditSelect = (game: GameData) => {
    setEditingGame(game);
    setTitle(game.title);
    setGenre(game.genre);
    setDeveloper(game.developer);
    setDescription(game.description);
    setThumbnail(game.thumbnail);
    setBanner(game.banner || game.thumbnail);
    setPortraitBackground(game.portraitBackground || "");
    setPreviewVideo(game.previewVideo || "");
    setIframeUrl(game.iframeUrl);
    setAccentColor(game.accentColor || "#00f0ff");
    setButtonGradient(game.buttonGradient || "from-[#00f0ff] to-[#b800ff]");
    setIsNew(!!game.isNew);
    setIsHot(!!game.isHot);
    setIsHero(!!game.isHero);
    setIsFeatured(!!game.isFeatured);
    setPlays(game.plays || "100K");
    setIsPortrait(!!game.isPortrait);
    setAspectRatio(game.aspectRatio || (game.isPortrait ? "9:16" : "16:9"));
    setFaqs(game.faqs || []);
    setGameplayVideos(game.gameplayVideos || []);
    
    // Load Zip Game fields
    setIsZipGame(!!game.isZipGame);
    setExistingZipSize(game.zipSize || null);
    setZipUrl(game.zipUrl || null);
  };

  const handleResetForm = () => {
    setEditingGame(null);
    setTitle("");
    setGenre("Action");
    setDeveloper("");
    setDescription("");
    setThumbnail("");
    setBanner("");
    setPortraitBackground("");
    setPreviewVideo("");
    setIframeUrl("");
    setAccentColor("#00f0ff");
    setButtonGradient("from-[#00f0ff] to-[#b800ff]");
    setIsNew(false);
    setIsHot(false);
    setIsHero(false);
    setIsFeatured(false);
    setPlays("100K");
    setIsPortrait(false);
    setAspectRatio("16:9");
    setFaqs([{ question: "Is this game free to play?", answer: "Yes, it is 100% free directly in your browser." }]);
    setGameplayVideos([{ title: "Official Walkthrough", videoUrl: "https://www.youtube.com/embed/n305c4xQ27Y" }]);
    setErrorMessage(null);
    
    // Reset ZIP states
    setIsZipGame(false);
    setZipUrl(null);
    setExistingZipSize(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !developer || !description || !thumbnail) {
      setErrorMessage("Please fill out all required fields marked with *");
      return;
    }

    if (!isZipGame && !iframeUrl) {
      setErrorMessage("Please specify the Active Gameplay Iframe URL for external games.");
      return;
    }

    if (isZipGame && !editingGame && !zipUrl) {
      setErrorMessage("Please upload an HTML5 Game ZIP Archive using the uploader below.");
      return;
    }

    // Validate Hero slider count (Limit of 4 maximum)
    if (isHero) {
      const existingHeroGames = games.filter((g) => g.isHero && g.id !== editingGame?.id);
      if (existingHeroGames.length >= 4) {
        setErrorMessage("Limit reached: You can select exactly up to 4 games for the Hero Slider. Please deselect another game first.");
        return;
      }
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const payload = {
      title,
      slug,
      genre,
      developer,
      description,
      thumbnail,
      banner: banner || thumbnail,
      portraitBackground: portraitBackground || undefined,
      previewVideo: previewVideo || undefined,
      iframeUrl: isZipGame ? "zip://local" : iframeUrl,
      isZipGame,
      zipSize: zipUrl ? "Cloud ZIP Hosted" : (existingZipSize || null),
      zipUrl: zipUrl || (editingGame?.zipUrl || null),
      accentColor,
      buttonGradient,
      isNew,
      isHot,
      isHero,
      isFeatured,
      plays,
      isPortrait,
      aspectRatio,
      faqs,
      gameplayVideos,
      rating: editingGame ? editingGame.rating : 5.0,
      tags: [genre, "3D", "WebGL"]
    };

    try {
      if (editingGame) {
        // Update
        const updatedGame: GameData = {
          ...editingGame,
          ...payload
        };
        await updateGameDB(updatedGame);
        setSuccessMessage("Game updated successfully!");
      } else {
        // Add
        await addGameDB(payload);
        setSuccessMessage("New game created successfully!");
      }

      handleResetForm();
      await refreshList();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to save game to database.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this game record?")) {
      try {
        await deleteGameDB(id);
        await refreshList();
        setSuccessMessage("Game record removed successfully.");
        setTimeout(() => setSuccessMessage(null), 2500);
      } catch (err) {
        console.error(err);
        setErrorMessage("Failed to delete game from database.");
      }
    }
  };

  // FAQ CRUD items
  const handleAddFAQ = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const handleRemoveFAQ = (index: number) => {
    setFaqs(faqs.filter((_, idx) => idx !== index));
  };

  const handleFAQChange = (index: number, field: keyof FAQItem, val: string) => {
    const updated = [...faqs];
    updated[index][field] = val;
    setFaqs(updated);
  };

  // Gameplay Walkthrough videos CRUD items
  const handleAddVideo = () => {
    setGameplayVideos([...gameplayVideos, { title: "", videoUrl: "" }]);
  };

  const handleRemoveVideo = (index: number) => {
    setGameplayVideos(gameplayVideos.filter((_, idx) => idx !== index));
  };

  const handleVideoChange = (index: number, field: keyof GameplayVideo, val: string) => {
    const updated = [...gameplayVideos];
    updated[index][field] = val;
    setGameplayVideos(updated);
  };

  return (
    <div className="w-full text-white pb-16">
      {/* Notifications banner */}
      <AnimatePresence>
        {errorMessage ? (
          <motion.div
            key="admin-error-alert"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="ml-auto p-1 text-red-400/50 hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : null}

        {successMessage ? (
          <motion.div
            key="admin-success-alert"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="ml-auto p-1 text-emerald-400/50 hover:text-emerald-400">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Header Segment */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-heading font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-electric-blue via-neon-cyan to-neon-purple flex items-center gap-2">
            <Cpu className="w-6 h-6 text-neon-cyan animate-spin-slow" />
            Developer Admin Center
          </h1>
          <p className="text-xs text-white/40 mt-1 font-mono">
            Manage your dynamic library slots, upload HTML5 ZIP files, and configure interactive specs.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
          <button
            onClick={onBackToHome}
            className="mt-4 md:mt-0 px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] transition-all text-xs font-bold tracking-wider uppercase font-mono cursor-pointer"
          >
            Exit Dashboard
          </button>
          
          {onLogout && (
            <button
              onClick={onLogout}
              className="mt-2 md:mt-0 px-5 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all text-xs font-bold tracking-wider uppercase font-mono cursor-pointer"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* HIGH-OCTANE METRICS PANEL GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c0c16]/80 to-[#121225]/50 border border-white/[0.04] backdrop-blur-xl relative overflow-hidden group hover:border-electric-blue/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-electric-blue/5 rounded-full blur-2xl group-hover:bg-electric-blue/10 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-white/40 uppercase font-mono tracking-widest">Games Hosted</span>
            <div className="w-8 h-8 rounded-lg bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center text-electric-blue">
              <Gamepad2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black font-heading text-white">{totalGames}</span>
          <span className="text-[10px] text-white/30 font-mono block mt-1">
            {zipGamesCount} ZIP packages hosted
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c0c16]/80 to-[#121225]/50 border border-white/[0.04] backdrop-blur-xl relative overflow-hidden group hover:border-neon-cyan/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-cyan/5 rounded-full blur-2xl group-hover:bg-neon-cyan/10 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-white/40 uppercase font-mono tracking-widest">Total Play Sessions</span>
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black font-heading text-white">{formatPlays(totalPlays)}+</span>
          <span className="text-[10px] text-white/30 font-mono block mt-1">
            Aggregated slot engagements
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c0c16]/80 to-[#121225]/50 border border-white/[0.04] backdrop-blur-xl relative overflow-hidden group hover:border-neon-purple/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-purple/5 rounded-full blur-2xl group-hover:bg-neon-purple/10 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-white/40 uppercase font-mono tracking-widest">ZIP Uploader Ratio</span>
            <div className="w-8 h-8 rounded-lg bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple">
              <UploadCloud className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black font-heading text-white">{zipRatio}%</span>
          <span className="text-[10px] text-white/30 font-mono block mt-1">
            HTML5 custom sandboxes
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c0c16]/80 to-[#121225]/50 border border-white/[0.04] backdrop-blur-xl relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-white/40 uppercase font-mono tracking-widest">Mean Game Rating</span>
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
              <Star className="w-4 h-4 fill-yellow-500/20" />
            </div>
          </div>
          <span className="text-2xl font-black font-heading text-white">{avgRating} ★</span>
          <span className="text-[10px] text-white/30 font-mono block mt-1">
            {heroCount}/4 Hero slots filled
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Game List Inventory catalog (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="p-5 rounded-2xl bg-[#07070a]/60 border border-white/[0.04] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-electric-blue" />
                <h2 className="text-sm font-heading font-black uppercase tracking-wider text-white/90">
                  Game Catalog List
                </h2>
              </div>
              <span className="text-[10px] font-bold text-white/30 font-mono">
                {games.length} Games Registered
              </span>
            </div>

            {/* Specialized + Add Game Button & Search Bar */}
            <div className="flex flex-col gap-3 mb-4 select-none">
              <div className="relative group">
                <Search className="w-3.5 h-3.5 text-white/35 absolute left-3.5 top-1/2 -translate-y-1/2 group-hover:text-white/60 transition-colors" />
                <input
                  type="text"
                  placeholder="Search catalog by title or genre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-electric-blue/40 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-white/30 focus:outline-none transition-all duration-300 focus:bg-white/[0.04]"
                />
              </div>

              <button
                type="button"
                onClick={handleResetForm}
                className="w-full py-3 rounded-xl border border-dashed border-white/10 hover:border-neon-purple/40 bg-white/[0.01] hover:bg-neon-purple/5 text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-white flex items-center justify-center gap-2 transition-all duration-300 shadow-inner group cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300 text-neon-purple animate-pulse" />
                + Create New Game Entry
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
              {games.filter((g) => 
                g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                g.genre.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((g) => {
                const isSelected = editingGame?.id === g.id;
                return (
                  <div
                    key={g.id}
                    className={`p-3.5 rounded-xl bg-white/[0.02] border transition-all flex items-center justify-between group/item ${
                      isSelected
                        ? "border-l-4 border-l-neon-purple border-electric-blue/30 bg-electric-blue/5 shadow-[0_4px_15px_rgba(168,85,247,0.05)]"
                        : "border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={g.thumbnail}
                        alt=""
                        className="w-11 h-11 rounded-lg object-cover border border-white/10 shrink-0 shadow-md transition-transform duration-300 group-hover/item:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800";
                        }}
                      />
                      <div className="flex flex-col overflow-hidden">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold truncate text-white/80">{g.title}</span>
                          {g.isZipGame && (
                            <span title="ZIP Hosted Game">
                              <FileArchive className="w-3 h-3 text-neon-purple shrink-0" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[9px] text-white/30 uppercase font-mono tracking-wider">{g.genre}</span>
                          {g.isHero && (
                            <span className="text-[7px] font-extrabold uppercase tracking-widest bg-neon-purple/20 text-neon-purple border border-neon-purple/35 px-1.5 py-0.5 rounded">
                              Hero
                            </span>
                          )}
                          {g.isNew && (
                            <span className="text-[7px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded">
                              New
                            </span>
                          )}
                          {g.isHot && (
                            <span className="text-[7px] font-extrabold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/25 px-1.5 py-0.5 rounded">
                              Hot
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-4 opacity-75 group-hover/item:opacity-100 transition-opacity">
                      {/* Edit button */}
                      <button
                        onClick={() => handleEditSelect(g)}
                        className={`p-2 rounded-lg transition-all cursor-pointer ${
                          isSelected ? "text-neon-purple bg-white/5 border border-white/10" : "text-white/40 hover:text-white/85 hover:bg-white/[0.04]"
                        }`}
                        title="Edit metadata fields"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="p-2 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                        title="Delete game record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive CRUD editor Form (7 cols) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSave}
            className="p-6 rounded-2xl bg-[#07070a]/60 border border-white/[0.04] backdrop-blur-xl flex flex-col gap-6 shadow-2xl relative"
          >
            {/* Visual Indicator of Edit Mode vs Create Mode */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${editingGame ? "bg-neon-purple shadow-[0_0_10px_#a855f7]" : "bg-electric-blue shadow-[0_0_10px_#6366f1]"}`} />
                <h2 className="text-sm font-heading font-black uppercase tracking-wider flex items-center gap-2">
                  {editingGame ? (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink">
                      EDITING: {editingGame.title}
                    </span>
                  ) : (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-neon-cyan">
                      CREATE GAME PROFILE
                    </span>
                  )}
                </h2>
              </div>
              {editingGame && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-[10px] font-bold text-white/40 hover:text-white uppercase font-mono px-2 py-1 rounded bg-white/5 border border-white/10 transition-colors cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Premium segmented capsule tabs */}
            <div className="flex border border-white/[0.06] bg-white/[0.01] p-1.5 rounded-2xl gap-1.5 select-none shrink-0 backdrop-blur-md">
              {(["general", "media", "hosting", "addons"] as const).map((tab) => {
                const isActive = activeTab === tab;
                let tabLabel = "General";
                let TabIcon = Settings;
                if (tab === "media") {
                  tabLabel = "Media Assets";
                  TabIcon = Video;
                } else if (tab === "hosting") {
                  tabLabel = "Hosting & Specs";
                  TabIcon = Laptop;
                } else if (tab === "addons") {
                  tabLabel = "Add-ons & FAQs";
                  TabIcon = HelpCircle;
                }

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-center text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-[#111116] border border-white/[0.08] text-white shadow-[0_0_15px_rgba(168,85,247,0.2)] font-black"
                        : "text-white/40 hover:text-white/70 hover:bg-white/[0.02] border border-transparent"
                    }`}
                  >
                    <TabIcon className={`w-3.5 h-3.5 ${isActive ? "text-neon-purple animate-pulse" : "text-white/30"}`} />
                    <span className="hidden sm:inline">{tabLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: GENERAL INFO PANEL */}
            {activeTab === "general" && (
              <div className="flex flex-col gap-5 animate-fade-in">
                {/* Core details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-white/40 uppercase font-mono tracking-wider">Game Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Pixel Drift Master"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-electric-blue/40 text-white transition-colors"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-white/40 uppercase font-mono tracking-wider">Genre *</label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="bg-[#0c0c0f] border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-electric-blue/40 text-white cursor-pointer transition-colors"
                    >
                      {["Action", "Adventure", "Racing", "Puzzle", "Shooting", "Sports", "Strategy", "Multiplayer", "Horror", "Simulation", "RPG", "Arcade", "io", "2player", "Clicker", "Driving"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-white/40 uppercase font-mono tracking-wider">Developer *</label>
                    <input
                      type="text"
                      placeholder="e.g. Zylo Interactive"
                      value={developer}
                      onChange={(e) => setDeveloper(e.target.value)}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-electric-blue/40 text-white transition-colors"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-white/40 uppercase font-mono tracking-wider">Mock Plays Count</label>
                    <input
                      type="text"
                      placeholder="e.g. 1.2M"
                      value={plays}
                      onChange={(e) => setPlays(e.target.value)}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-electric-blue/40 text-white transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase font-mono tracking-wider">Description *</label>
                  <textarea
                    placeholder="Write a captivating synopsis..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-xs h-32 resize-none focus:outline-none focus:border-electric-blue/40 text-white leading-relaxed transition-colors"
                    required
                  />
                </div>

                {/* Theme styling variables & Preset selections */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] flex flex-col gap-4">
                  <span className="text-[11px] font-bold text-white/60 flex items-center gap-1.5 font-mono tracking-wider border-b border-white/[0.04] pb-2">
                    <Palette className="w-4 h-4 text-neon-purple" />
                    Color Palette & Custom Theme
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Accent Solid Hex Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-9 h-9 rounded bg-transparent border-0 cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          placeholder="#00f0ff"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-electric-blue/40 font-mono text-white w-full"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Hero Button Gradient</label>
                      <input
                        type="text"
                        placeholder="from-[#00f0ff] to-[#b800ff]"
                        value={buttonGradient}
                        onChange={(e) => setButtonGradient(e.target.value)}
                        className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-electric-blue/40 font-mono text-white"
                      />
                    </div>
                  </div>

                  {/* Preset quick tiles */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-bold text-white/30 uppercase font-mono">Presets Quick Theme Selection</span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {PRESETS.map((p) => {
                        const isPresetSelected = accentColor.toLowerCase() === p.accent.toLowerCase() && buttonGradient === p.gradient;
                        return (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => handleApplyPreset(p.accent, p.gradient)}
                            className={`flex flex-col items-center justify-between p-2 rounded-lg border transition-all hover:bg-white/[0.03] cursor-pointer ${
                              isPresetSelected
                                ? "border-neon-purple bg-neon-purple/5 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                                : "border-white/[0.06] bg-white/[0.01]"
                            }`}
                          >
                            <span className="text-[9px] font-bold text-white/60 text-center leading-tight truncate w-full mb-1">
                              {p.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-2.5 h-2.5 rounded-full border border-white/20"
                                style={{ backgroundColor: p.accent }}
                              />
                              <div
                                className={`w-5 h-2.5 rounded border border-white/20 bg-gradient-to-r ${p.gradient}`}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MEDIA & ASSETS PANEL */}
            {activeTab === "media" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                {/* Media fields (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-5">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] flex flex-col gap-4">
                    <span className="text-[11px] font-bold text-white/60 flex items-center gap-1.5 font-mono tracking-wider">
                      <Video className="w-4 h-4 text-electric-blue" />
                      Media URL Resource Links
                    </span>

                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Thumbnail URL *</label>
                        <input
                          type="url"
                          placeholder="https://image-source.png"
                          value={thumbnail}
                          onChange={(e) => setThumbnail(e.target.value)}
                          className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-electric-blue/40 text-white transition-colors"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Hero Slider Banner URL</label>
                        <input
                          type="url"
                          placeholder="Fallback to Thumbnail if empty"
                          value={banner}
                          onChange={(e) => setBanner(e.target.value)}
                          className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-electric-blue/40 text-white transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Hover Preview Video Review URL</label>
                        <input
                          type="url"
                          placeholder="Looping silent .mp4 stream link"
                          value={previewVideo}
                          onChange={(e) => setPreviewVideo(e.target.value)}
                          className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-electric-blue/40 text-white transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Portrait Background URL (Optional)</label>
                        <input
                          type="url"
                          placeholder="https://... (High-res background for portrait games)"
                          value={portraitBackground}
                          onChange={(e) => setPortraitBackground(e.target.value)}
                          className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-electric-blue/40 text-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Live eSports Mockup Card (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c0c16]/90 to-[#121225]/40 border border-white/[0.04] flex flex-col gap-4 items-center justify-between text-center relative overflow-hidden h-full min-h-[350px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/5 rounded-full blur-3xl" />
                    
                    <span className="text-[10px] font-bold text-white/40 uppercase font-mono tracking-widest flex items-center gap-1.5 w-full border-b border-white/[0.04] pb-2 text-left justify-start">
                      <Sparkles className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
                      Live eSports Mockup Preview
                    </span>

                    {/* Simulated visual ticket */}
                    <div className="flex-1 flex items-center justify-center py-4 w-full">
                      <div
                        className="group relative bg-[#09090e] rounded-2xl overflow-hidden border transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
                        style={{
                          width: isPortrait ? (aspectRatio === "9:16" ? "140px" : aspectRatio === "3:4" ? "160px" : "150px") : "230px",
                          height: isPortrait ? (aspectRatio === "9:16" ? "248px" : aspectRatio === "3:4" ? "213px" : "225px") : "130px",
                          boxShadow: `0 10px 30px -10px rgba(0,0,0,0.8), 0 0 20px -3px ${accentColor}44`,
                          borderColor: `${accentColor}33`
                        }}
                      >
                        {/* Live Image backdrop */}
                        <img
                          src={thumbnail || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800"}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800";
                          }}
                        />

                        {/* Overlay info box */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-3 text-left">
                          {/* Top Tag Badges */}
                          <div className="absolute top-2.5 left-2.5 right-2.5 flex flex-wrap gap-1">
                            {isNew && (
                              <span className="text-[7px] font-extrabold uppercase tracking-widest bg-emerald-500 text-white px-1.5 py-0.5 rounded shadow">
                                New
                              </span>
                            )}
                            {isHot && (
                              <span className="text-[7px] font-extrabold uppercase tracking-widest bg-orange-500 text-white px-1.5 py-0.5 rounded shadow">
                                Hot
                              </span>
                            )}
                            {isHero && (
                              <span className="text-[7px] font-extrabold uppercase tracking-widest bg-neon-purple text-white px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                                <Trophy className="w-2 h-2 text-yellow-300" /> Hero
                              </span>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-[8px] font-mono text-white/50 mb-1">
                            <span className="flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5 text-orange-500" />
                              {plays || "100K"}
                            </span>
                            <span className="flex items-center gap-0.5 text-yellow-400">
                              <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                              5.0
                            </span>
                          </div>

                          {/* Dynamic Name */}
                          <span className="text-xs font-black tracking-wide text-white truncate drop-shadow-md">
                            {title || "Untitled Slot"}
                          </span>

                          {/* Action footer */}
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[8px] text-white/40 uppercase font-mono tracking-widest truncate max-w-[50%]">
                              {genre}
                            </span>
                            <div
                              className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full text-white bg-gradient-to-r ${buttonGradient} shadow-[0_0_8px_${accentColor}55]`}
                            >
                              Play
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full text-left pt-2 border-t border-white/[0.04]">
                      <span className="text-[10px] text-white/30 font-sans leading-relaxed block">
                        Displays the dynamic active state including aspects, gradients, tags, and accent shadows.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: HOSTING & SPECS PANEL */}
            {activeTab === "hosting" && (
              <div className="flex flex-col gap-5 animate-fade-in">
                {/* Hosting & Iframe/Zip Selection */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] flex flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Game Hosting Type *</label>
                    <div className="flex bg-white/[0.02] border border-white/[0.06] rounded-xl p-1 gap-1 w-fit">
                      <button
                        type="button"
                        onClick={() => setIsZipGame(false)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
                          !isZipGame
                            ? "bg-electric-blue text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                            : "text-white/40 hover:text-white/70"
                        }`}
                      >
                        Web Frame URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsZipGame(true)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
                          isZipGame
                            ? "bg-neon-purple text-white shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                            : "text-white/40 hover:text-white/70"
                        }`}
                      >
                        Upload ZIP Package
                      </button>
                    </div>

                    {!isZipGame ? (
                      <div className="flex flex-col gap-1.5 mt-2">
                        <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Active Gameplay Iframe URL *</label>
                        <input
                          type="url"
                          placeholder="e.g. https://hextris.github.io/hextris/"
                          value={iframeUrl}
                          onChange={(e) => setIframeUrl(e.target.value)}
                          className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-electric-blue/40 w-full text-white"
                          required={!isZipGame}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 mt-2">
                        <label className="text-[10px] font-bold text-white/40 uppercase font-mono">HTML5 Game ZIP Package *</label>
                        
                        <div className="border border-white/10 bg-white/[0.01] rounded-xl p-4">
                          {zipUrl ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-6">
                              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                                <CheckCircle className="w-6 h-6 animate-pulse" />
                              </div>
                              <span className="text-sm font-bold text-white/90">ZIP File Uploaded Successfully!</span>
                              <span className="text-[10px] text-white/50 font-mono break-all px-4 text-center">{zipUrl}</span>
                              <button
                                type="button"
                                onClick={() => setZipUrl(null)}
                                className="mt-2 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 transition-colors cursor-pointer"
                              >
                                Replace File
                              </button>
                            </div>
                          ) : (
                            <UploadDropzone
                              endpoint="gameZipUploader"
                              onClientUploadComplete={(res) => {
                                if (res && res.length > 0) {
                                  setZipUrl(res[0].url);
                                  setSuccessMessage("ZIP uploaded to cloud storage successfully! Now save the game.");
                                  setTimeout(() => setSuccessMessage(null), 3000);
                                }
                              }}
                              onUploadError={(error: Error) => {
                                setErrorMessage(`Upload failed: ${error.message}`);
                              }}
                              appearance={{
                                button: "bg-neon-purple text-white font-bold px-4 py-2 rounded-lg text-sm cursor-pointer",
                                container: "border border-dashed border-neon-purple/40 bg-neon-purple/5 hover:bg-neon-purple/10 transition-colors py-8",
                                label: "text-white/70 font-semibold hover:text-white",
                              }}
                              content={{
                                label: "Click or drop ZIP here to upload to UploadThing"
                              }}
                            />
                          )}
                          
                          {existingZipSize && !zipUrl && (
                            <div className="mt-4 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              Active ZIP currently hosted. Upload a new one to replace it.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sizing & Aspect ratio variables */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] flex flex-col gap-4">
                  {/* Orientation Toggles */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase font-mono tracking-wider">Game Display Orientation</label>
                    <div className="flex bg-white/[0.02] border border-white/[0.06] rounded-xl p-1 gap-1 w-fit">
                      <button
                        type="button"
                        onClick={() => {
                          setIsPortrait(false);
                          setAspectRatio("16:9");
                        }}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
                          !isPortrait
                            ? "bg-electric-blue text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                            : "text-white/40 hover:text-white/70"
                        }`}
                      >
                        <Laptop className="w-3.5 h-3.5" />
                        Landscape (16:9)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsPortrait(true);
                          setAspectRatio("9:16");
                        }}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
                          isPortrait
                            ? "bg-neon-purple text-white shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                            : "text-white/40 hover:text-white/70"
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        Portrait
                      </button>
                    </div>
                  </div>

                  {/* Specific Aspect Selection */}
                  {isPortrait && (
                    <div className="flex flex-col gap-2 mt-1 transition-all duration-300">
                      <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Portrait Aspect Ratio Selection</label>
                      <div className="flex bg-white/[0.02] border border-white/[0.06] rounded-xl p-1 gap-1 w-fit">
                        {(["9:16", "3:4", "2:3"] as const).map((ratio) => (
                          <button
                            key={ratio}
                            type="button"
                            onClick={() => setAspectRatio(ratio)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider cursor-pointer ${
                              aspectRatio === ratio
                                ? "bg-neon-purple text-white shadow-[0_0_8px_rgba(168,85,247,0.2)]"
                                : "text-white/40 hover:text-white/70"
                            }`}
                          >
                            {ratio === "9:16" ? "9:16 Mobile" : ratio === "3:4" ? "3:4 Arcade" : "2:3 Compact"}
                          </button>
                        ))}
                      </div>
                      <span className="text-[9px] text-white/35 font-sans leading-relaxed">
                        Select 3:4 for standard vertical arcade viewports (e.g. Raccoon Rescue bubble shooter) to eliminate black empty spaces.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: ADD-ONS (FAQs & VIDEOS) PANEL */}
            {activeTab === "addons" && (
              <div className="flex flex-col gap-5 animate-fade-in">
                {/* Status checkboxes */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] flex flex-col gap-3">
                  <label className="text-[10px] font-bold text-white/40 uppercase font-mono tracking-wider">Release Status Tags</label>
                  <div className="flex gap-6 mt-1 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isNew}
                        onChange={(e) => setIsNew(e.target.checked)}
                        className="w-4 h-4 bg-white/5 border border-white/10 rounded focus:ring-0 text-electric-blue"
                      />
                      <span className="text-xs font-bold text-white/70">Tag as NEW release</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isHot}
                        onChange={(e) => setIsHot(e.target.checked)}
                        className="w-4 h-4 bg-white/5 border border-white/10 rounded focus:ring-0 text-electric-blue"
                      />
                      <span className="text-xs font-bold text-white/70">Tag as HOT trending item</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isHero}
                        onChange={(e) => setIsHero(e.target.checked)}
                        className="w-4 h-4 bg-white/5 border border-white/10 rounded focus:ring-0 text-electric-blue"
                      />
                      <span className="text-xs font-bold text-white/70 flex items-center gap-1">
                        Tag as HERO slider game
                        <span className="text-[9px] font-mono text-neon-purple">(max 4 slots)</span>
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 bg-white/5 border border-white/10 rounded focus:ring-0 text-electric-blue"
                      />
                      <span className="text-xs font-bold text-white/70">Tag as FEATURED grid slot</span>
                    </label>
                  </div>
                </div>

                {/* FAQ list manager */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.03]">
                    <span className="text-[11px] font-bold text-white/60 flex items-center gap-1.5 font-mono">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                      Dynamic FAQs Builder
                    </span>
                    <button
                      type="button"
                      onClick={handleAddFAQ}
                      className="px-2.5 py-1 rounded bg-electric-blue/10 border border-electric-blue/20 hover:bg-electric-blue/20 text-[10px] font-bold text-electric-blue transition-colors font-mono cursor-pointer"
                    >
                      + Add FAQ
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {faqs.map((faq, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#07070d] border border-white/[0.04] flex flex-col gap-2 relative group/faq">
                        <button
                          type="button"
                          onClick={() => handleRemoveFAQ(idx)}
                          className="absolute top-2.5 right-2.5 p-1 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer opacity-50 group-hover/faq:opacity-100"
                          title="Remove this FAQ item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="flex flex-col gap-1 pr-8">
                          <input
                            type="text"
                            placeholder="FAQ Question..."
                            value={faq.question}
                            onChange={(e) => handleFAQChange(idx, "question", e.target.value)}
                            className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-electric-blue/30 font-semibold text-white"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1 pr-8">
                          <textarea
                            placeholder="FAQ Answer details..."
                            value={faq.answer}
                            onChange={(e) => handleFAQChange(idx, "answer", e.target.value)}
                            className="bg-white/[0.01] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-xs h-14 resize-none focus:outline-none focus:border-electric-blue/30 text-white/60"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gameplay videos list manager */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.03]">
                    <span className="text-[11px] font-bold text-white/60 flex items-center gap-1.5 font-mono">
                      <Video className="w-3.5 h-3.5 text-red-500" />
                      Gameplay Walkthrough Video Links
                    </span>
                    <button
                      type="button"
                      onClick={handleAddVideo}
                      className="px-2.5 py-1 rounded bg-electric-blue/10 border border-electric-blue/20 hover:bg-electric-blue/20 text-[10px] font-bold text-electric-blue transition-colors font-mono cursor-pointer"
                    >
                      + Add Video Link
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {gameplayVideos.map((vid, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end p-3 rounded-lg bg-[#07070d] border border-white/[0.04] relative group/video">
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(idx)}
                          className="absolute top-2.5 right-2.5 p-1 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer opacity-50 group-hover/video:opacity-100"
                          title="Remove this video item"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>

                        <div className="flex flex-col gap-1.5 pr-6">
                          <label className="text-[9px] font-bold text-white/30 uppercase font-mono">Video Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Pro Gameplay Tips"
                            value={vid.title}
                            onChange={(e) => handleVideoChange(idx, "title", e.target.value)}
                            className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none text-white font-semibold"
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold text-white/30 uppercase font-mono">Embed Video URL</label>
                          <input
                            type="url"
                            placeholder="e.g. https://www.youtube.com/embed/n305c4xQ27Y"
                            value={vid.videoUrl}
                            onChange={(e) => handleVideoChange(idx, "videoUrl", e.target.value)}
                            className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none text-white font-mono"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions Submit */}
            <div className="flex items-center justify-end gap-3 mt-4 border-t border-white/[0.04] pt-4">
              {editingGame && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-5 py-3 rounded-xl border border-white/10 hover:bg-white/[0.04] text-white/50 hover:text-white transition-all text-xs font-bold tracking-widest uppercase font-mono cursor-pointer"
                >
                  Discard Changes
                </button>
              )}
              
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white hover:brightness-110 shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all font-heading font-black text-xs uppercase tracking-widest cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {editingGame ? "Update Game Slot" : "Publish Game Slot"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
