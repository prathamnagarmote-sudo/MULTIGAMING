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
  Laptop
} from "lucide-react";
import {
  GameData,
  FAQItem,
  GameplayVideo,
  getGamesDB,
  saveGamesDB,
  addGameDB,
  updateGameDB,
  deleteGameDB,
  saveGameZIP
} from "@/utils/db";

interface AdminDashboardProps {
  onBackToHome: () => void;
}

export function AdminDashboard({ onBackToHome }: AdminDashboardProps) {
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
  const [previewVideo, setPreviewVideo] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");
  const [accentColor, setAccentColor] = useState("#00f0ff");
  const [buttonGradient, setButtonGradient] = useState("from-[#00f0ff] to-[#b800ff]");
  const [isNew, setIsNew] = useState(false);
  const [isHot, setIsHot] = useState(false);
  const [plays, setPlays] = useState("100K");
  const [isPortrait, setIsPortrait] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "3:4" | "2:3">("16:9");

  // ZIP Upload States
  const [isZipGame, setIsZipGame] = useState(false);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [existingZipSize, setExistingZipSize] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // File size formatter
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".zip")) {
        setZipFile(file);
      } else {
        setErrorMessage("Only .zip files are supported for HTML5 games.");
        setTimeout(() => setErrorMessage(null), 3000);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name.endsWith(".zip")) {
        setZipFile(file);
      } else {
        setErrorMessage("Only .zip files are supported for HTML5 games.");
        setTimeout(() => setErrorMessage(null), 3000);
      }
    }
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
    setGames(getGamesDB());
  }, []);

  const refreshList = () => {
    setGames(getGamesDB());
  };

  const handleEditSelect = (game: GameData) => {
    setEditingGame(game);
    setTitle(game.title);
    setGenre(game.genre);
    setDeveloper(game.developer);
    setDescription(game.description);
    setThumbnail(game.thumbnail);
    setBanner(game.banner || game.thumbnail);
    setPreviewVideo(game.previewVideo || "");
    setIframeUrl(game.iframeUrl);
    setAccentColor(game.accentColor || "#00f0ff");
    setButtonGradient(game.buttonGradient || "from-[#00f0ff] to-[#b800ff]");
    setIsNew(!!game.isNew);
    setIsHot(!!game.isHot);
    setPlays(game.plays || "100K");
    setIsPortrait(!!game.isPortrait);
    setAspectRatio(game.aspectRatio || (game.isPortrait ? "9:16" : "16:9"));
    setFaqs(game.faqs || []);
    setGameplayVideos(game.gameplayVideos || []);
    
    // Load Zip Game fields
    setIsZipGame(!!game.isZipGame);
    setExistingZipSize(game.zipSize || null);
    setZipFile(null);
  };

  const handleResetForm = () => {
    setEditingGame(null);
    setTitle("");
    setGenre("Action");
    setDeveloper("");
    setDescription("");
    setThumbnail("");
    setBanner("");
    setPreviewVideo("");
    setIframeUrl("");
    setAccentColor("#00f0ff");
    setButtonGradient("from-[#00f0ff] to-[#b800ff]");
    setIsNew(false);
    setIsHot(false);
    setPlays("100K");
    setIsPortrait(false);
    setAspectRatio("16:9");
    setFaqs([{ question: "Is this game free to play?", answer: "Yes, it is 100% free." }]);
    setGameplayVideos([{ title: "Official Walkthrough", videoUrl: "https://www.youtube.com/embed/n305c4xQ27Y" }]);
    setErrorMessage(null);
    
    // Reset ZIP states
    setIsZipGame(false);
    setZipFile(null);
    setExistingZipSize(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !developer || !description || !thumbnail) {
      setErrorMessage("Please fill out all required fields marked with *");
      return;
    }

    if (!isZipGame && !iframeUrl) {
      setErrorMessage("Please specify the Active Gameplay Iframe URL for external games.");
      return;
    }

    if (isZipGame && !editingGame && !zipFile) {
      setErrorMessage("Please upload an HTML5 Game ZIP Archive.");
      return;
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
      previewVideo: previewVideo || undefined,
      iframeUrl: isZipGame ? "zip://local" : iframeUrl,
      isZipGame,
      zipSize: zipFile ? formatBytes(zipFile.size) : (existingZipSize || undefined),
      accentColor,
      buttonGradient,
      isNew,
      isHot,
      plays,
      isPortrait,
      aspectRatio,
      faqs,
      gameplayVideos,
      rating: editingGame ? editingGame.rating : 5.0,
      tags: [genre, "3D", "WebGL"]
    };

    let savedGame: GameData;
    if (editingGame) {
      // Update
      const updatedGame: GameData = {
        ...editingGame,
        ...payload
      };
      updateGameDB(updatedGame);
      savedGame = updatedGame;
      setSuccessMessage("Game updated successfully!");
    } else {
      // Add
      savedGame = addGameDB(payload);
      setSuccessMessage("New game created successfully!");
    }

    // Save ZIP binary file asynchronously to IndexedDB
    if (isZipGame && zipFile) {
      saveGameZIP(savedGame.id, zipFile)
        .then(() => {
          console.log("ZIP binary written successfully in IndexedDB for game ID:", savedGame.id);
        })
        .catch((err) => {
          console.error("IndexedDB zip write error:", err);
          setErrorMessage("Failed to write ZIP package binary to browser storage.");
        });
    }

    handleResetForm();
    refreshList();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this game record?")) {
      deleteGameDB(id);
      refreshList();
      setSuccessMessage("Game record removed successfully.");
      setTimeout(() => setSuccessMessage(null), 2500);
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
        {errorMessage && (
          <motion.div
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
        )}

        {successMessage && (
          <motion.div
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
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-heading font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-electric-blue via-neon-cyan to-neon-purple">
            Developer Admin Center
          </h1>
          <p className="text-xs text-white/40 mt-1 font-mono">
            Manage your dynamic library slots, upload HTML5 ZIP files, and configure interactive specs.
          </p>
        </div>

        <button
          onClick={onBackToHome}
          className="mt-4 md:mt-0 px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] transition-all text-xs font-bold tracking-wider uppercase font-mono"
        >
          Exit Admin Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Game List Inventory catalog (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="p-5 rounded-2xl bg-[#07070a]/60 border border-white/[0.04] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-electric-blue" />
                <h2 className="text-sm font-heading font-black uppercase tracking-wider">
                  Game Catalog List
                </h2>
              </div>
              <span className="text-[10px] font-bold text-white/30 font-mono">
                {games.length} Games Registered
              </span>
            </div>

            <div className="flex flex-col gap-3 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
              {games.map((g) => (
                <div
                  key={g.id}
                  className={`p-3 rounded-xl bg-white/[0.02] border transition-all flex items-center justify-between ${
                    editingGame?.id === g.id
                      ? "border-electric-blue/40 bg-electric-blue/5"
                      : "border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={g.thumbnail}
                      alt=""
                      className="w-11 h-11 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-bold truncate text-white/80">{g.title}</span>
                      <span className="text-[10px] text-white/30 uppercase mt-0.5 font-mono">{g.genre}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-4">
                    {/* Edit button */}
                    <button
                      onClick={() => handleEditSelect(g)}
                      className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all"
                      title="Edit metadata fields"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="p-2 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete game record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive CRUD editor Form (7 cols) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSave}
            className="p-6 rounded-2xl bg-[#07070a]/60 border border-white/[0.04] backdrop-blur-xl flex flex-col gap-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
              <h2 className="text-sm font-heading font-black uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-electric-blue" />
                {editingGame ? `Edit Game: ${editingGame.title}` : "Upload New Game Entry"}
              </h2>
              {editingGame && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-[10px] font-bold text-white/30 hover:text-white uppercase font-mono"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Core details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Game Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Pixel Drift Master"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-electric-blue/40"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Genre *</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="bg-[#0c0c0f] border border-white/[0.06] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-electric-blue/40 text-white"
                >
                  {["Action", "Adventure", "Racing", "Puzzle", "Shooting", "Sports", "Strategy", "Multiplayer", "Horror", "Simulation", "RPG", "Arcade", "io", "2player", "Clicker", "Driving"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Developer *</label>
                <input
                  type="text"
                  placeholder="e.g. Zylo Interactive"
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-electric-blue/40"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Mock Plays Count</label>
                <input
                  type="text"
                  placeholder="e.g. 1.2M"
                  value={plays}
                  onChange={(e) => setPlays(e.target.value)}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-electric-blue/40"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Description *</label>
              <textarea
                placeholder="Write a captivating synopsis..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs h-20 resize-none focus:outline-none focus:border-electric-blue/40"
                required
              />
            </div>

            {/* Media URLs Section */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] flex flex-col gap-4">
              <span className="text-[11px] font-bold text-white/60 flex items-center gap-1.5 font-mono">
                <Video className="w-3.5 h-3.5 text-electric-blue" />
                Media URL Resource Links
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Thumbnail URL *</label>
                  <input
                    type="url"
                    placeholder="https://image-source.png"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-electric-blue/40"
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
                    className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-electric-blue/40"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Hover Preview Video Review URL</label>
                  <input
                    type="url"
                    placeholder="Looping silent .mp4 stream link"
                    value={previewVideo}
                    onChange={(e) => setPreviewVideo(e.target.value)}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-electric-blue/40"
                  />
                </div>

                <div className="flex flex-col gap-3 md:col-span-2">
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
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Active Game play Iframe URL *</label>
                      <input
                        type="url"
                        placeholder="e.g. https://hextris.github.io/hextris/"
                        value={iframeUrl}
                        onChange={(e) => setIframeUrl(e.target.value)}
                        className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-electric-blue/40 w-full"
                        required={!isZipGame}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-white/40 uppercase font-mono">HTML5 Game ZIP Package *</label>
                      
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("zip-file-input")?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 relative overflow-hidden ${
                          dragOver
                            ? "border-neon-purple bg-neon-purple/5 shadow-[0_0_15px_rgba(184,0,255,0.15)]"
                            : "border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02]"
                        }`}
                      >
                        <input
                          id="zip-file-input"
                          type="file"
                          accept=".zip"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        
                        {zipFile ? (
                          <>
                            <div className="w-12 h-12 rounded-xl bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center text-neon-purple shadow-[0_0_15px_rgba(184,0,255,0.2)]">
                              <FileArchive className="w-6 h-6 animate-pulse" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-bold text-white/90 truncate max-w-[280px]">{zipFile.name}</span>
                              <span className="text-[10px] font-mono text-white/40">{formatBytes(zipFile.size)}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setZipFile(null);
                              }}
                              className="px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-[10px] font-bold uppercase tracking-wider font-mono transition-colors cursor-pointer"
                            >
                              Remove file
                            </button>
                          </>
                        ) : (
                          <>
                            <div className={`w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 transition-all ${
                              dragOver ? "text-neon-purple border-neon-purple/30 bg-neon-purple/5" : ""
                            }`}>
                              <UploadCloud className="w-6 h-6 animate-bounce" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-bold text-white/70">
                                Drag & drop your game .zip file here
                              </span>
                              <span className="text-[10px] text-white/30 font-mono">
                                or click to browse local folders
                              </span>
                            </div>
                            
                            {existingZipSize && (
                              <div className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                Active ZIP stored: {existingZipSize} (upload new to replace)
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Design styles */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] flex flex-col gap-4">
              <span className="text-[11px] font-bold text-white/60 flex items-center gap-1.5 font-mono">
                <Layers className="w-3.5 h-3.5 text-neon-purple" />
                Custom Accent Styles & Status
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Accent Solid Hex Color</label>
                  <input
                    type="text"
                    placeholder="#00f0ff"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-electric-blue/40 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Hero Button Gradient (Tailwind Class)</label>
                  <input
                    type="text"
                    placeholder="from-[#00f0ff] to-[#b800ff]"
                    value={buttonGradient}
                    onChange={(e) => setButtonGradient(e.target.value)}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-electric-blue/40 font-mono"
                  />
                </div>
              </div>

              {/* Game Orientation Picker */}
              <div className="flex flex-col gap-2 mt-1 pb-3 border-b border-white/[0.04]">
                <label className="text-[10px] font-bold text-white/40 uppercase font-mono">Game Display Orientation</label>
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

              {/* Specific Portrait Aspect Ratio Selector (only shown if isPortrait is true) */}
              {isPortrait && (
                <div className="flex flex-col gap-2 mt-1 pb-3 border-b border-white/[0.04] transition-all duration-300">
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
                        {ratio === "9:16" ? "9:16 (Tall Mobile)" : ratio === "3:4" ? "3:4 (Tablet/Arcade)" : "2:3 (Compact)"}
                      </button>
                    ))}
                  </div>
                  <span className="text-[9px] text-white/35 font-sans leading-relaxed">
                    Choose 3:4 or 2:3 to resolve empty black space at the bottom of standard vertical arcade games (e.g. Raccoon Rescue bubble shooter).
                  </span>
                </div>
              )}

              {/* Status checkboxes */}
              <div className="flex gap-6 mt-1.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="w-4 h-4 bg-white/5 border border-white/10 rounded focus:ring-0 text-electric-blue"
                  />
                  <span className="text-xs font-bold text-white/70">Tag as NEW release release</span>
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
              </div>
            </div>

            {/* Dynamic FAQs Section */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.03]">
                <span className="text-[11px] font-bold text-white/60 flex items-center gap-1.5 font-mono">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                  Dynamic FAQs builder
                </span>
                <button
                  type="button"
                  onClick={handleAddFAQ}
                  className="px-2 py-1 rounded bg-electric-blue/10 border border-electric-blue/20 hover:bg-electric-blue/20 text-[10px] font-bold text-electric-blue transition-colors font-mono"
                >
                  + Add FAQ
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.04] flex flex-col gap-2 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveFAQ(idx)}
                      className="absolute top-2 right-2 p-1 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                      title="Remove this FAQ item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <div className="flex flex-col gap-1 pr-6">
                      <input
                        type="text"
                        placeholder="FAQ Question..."
                        value={faq.question}
                        onChange={(e) => handleFAQChange(idx, "question", e.target.value)}
                        className="bg-white/[0.03] border border-white/[0.06] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-electric-blue/30 font-semibold"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <textarea
                        placeholder="FAQ Answer details..."
                        value={faq.answer}
                        onChange={(e) => handleFAQChange(idx, "answer", e.target.value)}
                        className="bg-white/[0.02] border border-white/[0.06] rounded px-2.5 py-1.5 text-xs h-14 resize-none focus:outline-none focus:border-electric-blue/30 text-white/60"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Walkthrough Video Section */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.03]">
                <span className="text-[11px] font-bold text-white/60 flex items-center gap-1.5 font-mono">
                  <Video className="w-3.5 h-3.5 text-red-500" />
                  Gameplay Walkthrough Video Links
                </span>
                <button
                  type="button"
                  onClick={handleAddVideo}
                  className="px-2 py-1 rounded bg-electric-blue/10 border border-electric-blue/20 hover:bg-electric-blue/20 text-[10px] font-bold text-electric-blue transition-colors font-mono"
                >
                  + Add Walkthrough Video
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {gameplayVideos.map((vid, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end p-3 rounded-lg bg-white/[0.01] border border-white/[0.04] relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveVideo(idx)}
                      className="absolute top-2 right-2 p-1 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
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
                        className="bg-white/[0.03] border border-white/[0.06] rounded px-2.5 py-1.5 text-xs focus:outline-none"
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
                        className="bg-white/[0.03] border border-white/[0.06] rounded px-2.5 py-1.5 text-xs focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Submit */}
            <div className="flex items-center justify-end gap-3 mt-4">
              {editingGame && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-5 py-3 rounded-xl border border-white/10 hover:bg-white/[0.04] text-white/50 hover:text-white transition-all text-xs font-bold tracking-widest uppercase font-mono"
                >
                  Discard Changes
                </button>
              )}
              
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white hover:brightness-110 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all font-heading font-black text-xs uppercase tracking-widest cursor-pointer"
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
