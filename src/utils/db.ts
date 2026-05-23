import { ALL_GAMES, GameData as MockGameData } from "@/data/mockGames";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface GameplayVideo {
  title: string;
  videoUrl: string;
}

export interface GameData {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  banner: string;
  portraitBackground?: string; // Specific background for portrait games in fullscreen
  previewVideo?: string;
  genre: string;
  tags: string[];
  rating: number;
  plays: string;
  isNew?: boolean;
  isHot?: boolean;
  isFeatured?: boolean;
  isHero?: boolean; // Selected for Hero Section Slider (strictly max 4)
  developer: string;
  description: string;
  
  // Custom interactive fields
  iframeUrl: string;
  gameplayVideos?: GameplayVideo[];
  faqs?: FAQItem[];
  likes: number;
  dislikes: number;
  userVote?: "like" | "dislike" | null;
  
  // Design details
  accentColor?: string;
  buttonGradient?: string;
  releaseDate?: string;
  technology?: string;
  platforms?: string[];
  
  // ZIP Game fields
  isZipGame?: boolean;
  zipSize?: string;
  isPortrait?: boolean;
  aspectRatio?: "16:9" | "9:16" | "3:4" | "2:3";
}

const STORAGE_KEY = "zylo_games_db";

const DEFAULT_FAQS: FAQItem[] = [
  {
    question: "Is this game free to play?",
    answer: "Yes! All games on ZyloGames are completely free to play directly in your browser with no downloads or installation required."
  },
  {
    question: "Can I play this game with a controller?",
    answer: "Most of our games support keyboard and mouse controls. Games built with Unity or WebGL may also support standard gamepad controllers."
  },
  {
    question: "How do I save my progress?",
    answer: "Your game progress is saved automatically inside your browser's local cache. Clearing your cookies or cache may reset your highscores."
  }
];

const DEFAULT_VIDEOS = (genre: string): GameplayVideo[] => [
  {
    title: "Official Gameplay Walkthrough",
    videoUrl: "https://www.youtube.com/embed/n305c4xQ27Y"
  },
  {
    title: "100% Speedrun Guide",
    videoUrl: "https://www.youtube.com/embed/3hSj6LdG19Y"
  }
];

// Helper to seed dynamic games from standard mockGames
const createInitialSeed = (): GameData[] => {
  const seeded: GameData[] = [];

  // 1. Carrom Drift (Hero Game 1)
  seeded.push({
    id: "carrom-drift",
    title: "Carrom Drift",
    slug: "carrom-drift",
    genre: "Racing",
    tags: ["Racing", "Drift", "Physics"],
    rating: 4.8,
    plays: "1.2M",
    isNew: true,
    isHot: true,
    isHero: true,
    developer: "Speed Forge Studios",
    description: "Experience the high-octane fusion of tactical carrom physics and aggressive drift racing. Compete against players worldwide in beautifully animated arenas.",
    thumbnail: "/carrom_drift_gameplay.png",
    banner: "/carrom_drift_gameplay.png",
    previewVideo: "https://assets.mixkit.co/videos/preview/mixkit-retro-futuristic-grid-and-canyon-39846-large.mp4",
    iframeUrl: "https://hextris.github.io/hextris/", // highly interactive puzzle engine
    likes: 840,
    dislikes: 22,
    accentColor: "#ff9f0a",
    buttonGradient: "from-[#ff9f0a] to-[#ff5e00]",
    releaseDate: "March 2026",
    technology: "HTML5 (Canvas)",
    platforms: ["Browser (Desktop, Mobile, Tablet)"],
    faqs: [
      {
        question: "How do I control the striker car?",
        answer: "Use the Arrow keys or WASD to accelerate and steer. Hold Spacebar to trigger a precision handbrake drift around corners."
      },
      ...DEFAULT_FAQS
    ],
    gameplayVideos: [
      { title: "Carrom Drift - Epic High Score Walkthrough", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      ...DEFAULT_VIDEOS("Racing")
    ]
  });

  // 2. Cyberpunk Echoes (Hero Game 2)
  seeded.push({
    id: "cyberpunk-echoes",
    title: "Cyberpunk Echoes",
    slug: "cyberpunk-echoes",
    genre: "Action",
    tags: ["Action", "RPG", "Sci-Fi"],
    rating: 4.9,
    plays: "2.4M",
    isHot: true,
    isHero: true,
    developer: "ZyloGames Studios",
    description: "Explore a vast cyberpunk metropolis filled with danger, intrigue, and neon-lit streets. Upgrade your cybernetic implants and outrun corporate security.",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
    previewVideo: "https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-futuristic-tunnel-39832-large.mp4",
    iframeUrl: "https://playcanv.as/p/2OlkUaxF/", // Amazing fully responsive 3D space shooter game
    likes: 1240,
    dislikes: 45,
    accentColor: "#b800ff",
    buttonGradient: "from-[#b800ff] to-[#ff007f]",
    releaseDate: "January 2026",
    technology: "WebGL (PlayCanvas)",
    platforms: ["Browser (Desktop, Tablet)"],
    faqs: DEFAULT_FAQS,
    gameplayVideos: DEFAULT_VIDEOS("Action")
  });

  // 3. Stellar Frontier (Hero Game 3)
  seeded.push({
    id: "stellar-frontier",
    title: "Stellar Frontier",
    slug: "stellar-frontier",
    genre: "Shooting",
    tags: ["FPS", "Sci-Fi", "Multiplayer"],
    rating: 4.8,
    plays: "1.8M",
    isHot: true,
    isHero: true,
    developer: "ZyloGames Interactive",
    description: "Engage in epic space battles across galaxies in this multiplayer space flight combat experience. Command starfighters and conquer alien outposts.",
    thumbnail: "https://images.unsplash.com/photo-1614294148960-9aa740632a87?q=80&w=800&auto=format&fit=crop",
    banner: "https://images.unsplash.com/photo-1614294148960-9aa740632a87?q=80&w=1200&auto=format&fit=crop",
    previewVideo: "https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-futuristic-tunnel-39832-large.mp4",
    iframeUrl: "https://spacehuggers.com/play/", // Epic HTML5 run and gun game
    likes: 950,
    dislikes: 30,
    accentColor: "#00f0ff",
    buttonGradient: "from-[#00f0ff] to-[#00ffcc]",
    releaseDate: "February 2026",
    technology: "HTML5 (Phaser)",
    platforms: ["Browser (Desktop, Mobile, Tablet)"],
    faqs: DEFAULT_FAQS,
    gameplayVideos: DEFAULT_VIDEOS("Shooting")
  });

  // 4. Neon Drift (Hero Game 4)
  seeded.push({
    id: "neon-drift",
    title: "Neon Drift",
    slug: "neon-drift",
    genre: "Racing",
    tags: ["Racing", "Multiplayer", "Drift"],
    rating: 4.6,
    plays: "890K",
    isNew: true,
    isHero: true,
    developer: "Speed Forge",
    description: "Drift through neon-lit cityscapes in this high-octane multiplayer racer. Evade obstacles and unlock advanced customized vehicles.",
    thumbnail: "https://images.unsplash.com/photo-1614294149010-950b698f72c0?q=80&w=800&auto=format&fit=crop",
    banner: "https://images.unsplash.com/photo-1614294149010-950b698f72c0?q=80&w=1200&auto=format&fit=crop",
    previewVideo: "https://assets.mixkit.co/videos/preview/mixkit-retro-futuristic-grid-and-canyon-39846-large.mp4",
    iframeUrl: "https://hextris.github.io/hextris/",
    likes: 540,
    dislikes: 18,
    accentColor: "#ff007f",
    buttonGradient: "from-[#ff007f] to-[#ff9f0a]",
    releaseDate: "April 2026",
    technology: "HTML5 (WebGL)",
    platforms: ["Browser (Desktop, Mobile, Tablet)"],
    faqs: DEFAULT_FAQS,
    gameplayVideos: DEFAULT_VIDEOS("Racing")
  });

  // Seed the remaining games from mockGames, ensuring no duplicate IDs
  ALL_GAMES.forEach((g) => {
    // Avoid double seeding already created items
    if (["carrom-drift", "cyberpunk-echoes", "stellar-frontier", "neon-drift", "f1", "f2", "g1"].includes(g.id)) {
      return;
    }
    
    // Determine preview video based on genre
    let videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-neon-light-retro-music-background-with-grid-lines-39841-large.mp4";
    if (g.genre.toLowerCase().includes("racing") || g.genre.toLowerCase().includes("driving")) {
      videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-retro-futuristic-grid-and-canyon-39846-large.mp4";
    } else if (g.genre.toLowerCase().includes("action") || g.genre.toLowerCase().includes("shooting") || g.genre.toLowerCase().includes("multiplayer")) {
      videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-futuristic-tunnel-39832-large.mp4";
    }

    seeded.push({
      id: g.id,
      title: g.title,
      slug: g.slug,
      thumbnail: g.thumbnail,
      banner: g.thumbnail, // fallback to thumbnail for banner
      previewVideo: videoUrl,
      genre: g.genre,
      tags: g.tags,
      rating: g.rating,
      plays: g.plays,
      isNew: g.isNew,
      isHot: g.isHot,
      isFeatured: g.isFeatured,
      developer: g.developer,
      description: g.description,
      iframeUrl: "https://hextris.github.io/hextris/", // default playable iframe fallback
      likes: Math.floor(Math.random() * 400) + 100,
      dislikes: Math.floor(Math.random() * 20) + 2,
      accentColor: "#00f0ff",
      buttonGradient: "from-[#00f0ff] to-[#b800ff]",
      releaseDate: "March 2025",
      technology: "HTML5 (Unity WebGL)",
      platforms: ["Browser (Desktop, Mobile)"],
      faqs: DEFAULT_FAQS,
      gameplayVideos: DEFAULT_VIDEOS(g.genre)
    });
  });

  return seeded;
};

// Database Methods
export const getGamesDB = (): GameData[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initial = createInitialSeed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

export const saveGamesDB = (games: GameData[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
};

export const addGameDB = (game: Omit<GameData, "id" | "likes" | "dislikes">): GameData => {
  const games = getGamesDB();
  const newGame: GameData = {
    ...game,
    id: `g-${Date.now()}`,
    likes: 0,
    dislikes: 0
  };
  games.push(newGame);
  saveGamesDB(games);
  return newGame;
};

export const updateGameDB = (updatedGame: GameData): void => {
  const games = getGamesDB();
  const index = games.findIndex((g) => g.id === updatedGame.id);
  if (index !== -1) {
    games[index] = updatedGame;
    saveGamesDB(games);
  }
};

export const deleteGameDB = (id: string): void => {
  const games = getGamesDB();
  const filtered = games.filter((g) => g.id !== id);
  saveGamesDB(filtered);
  
  // Cascade clean-up ZIP binaries from IndexedDB
  deleteGameZIP(id).catch((err) => {
    console.error("Failed to purge game ZIP from IndexedDB store:", err);
  });
};

export const toggleHeroDB = (id: string): { success: boolean; message: string } => {
  const games = getGamesDB();
  const index = games.findIndex((g) => g.id === id);
  if (index === -1) {
    return { success: false, message: "Game not found." };
  }

  const currentHeroCount = games.filter((g) => g.isHero).length;
  const isCurrentlyHero = games[index].isHero;

  if (!isCurrentlyHero && currentHeroCount >= 4) {
    return {
      success: false,
      message: "Strict limit reached: You can select exactly up to 4 games for the Hero Slider. Please deselect a game first."
    };
  }

  games[index].isHero = !isCurrentlyHero;
  saveGamesDB(games);
  
  return {
    success: true,
    message: games[index].isHero ? "Added to Hero Slider." : "Removed from Hero Slider."
  };
};

export const submitVoteDB = (id: string, voteType: "like" | "dislike"): GameData | null => {
  const games = getGamesDB();
  const index = games.findIndex((g) => g.id === id);
  if (index === -1) return null;

  const game = games[index];
  const previousVote = game.userVote;

  if (previousVote === voteType) {
    // Retract vote
    if (voteType === "like") game.likes = Math.max(0, game.likes - 1);
    else game.dislikes = Math.max(0, game.dislikes - 1);
    game.userVote = null;
  } else {
    // Change vote or vote first time
    if (previousVote) {
      // Retract previous vote
      if (previousVote === "like") game.likes = Math.max(0, game.likes - 1);
      else game.dislikes = Math.max(0, game.dislikes - 1);
    }
    // Add new vote
    if (voteType === "like") game.likes += 1;
    else game.dislikes += 1;
    game.userVote = voteType;
  }

  games[index] = game;
  saveGamesDB(games);
  return game;
};

// ==========================================
// INDEXEDDB BINARY STORAGE ENGINE FOR GAME ZIPS
// ==========================================
const IDB_NAME = "ZyloGamesZIPs";
const IDB_VERSION = 1;
const STORE_NAME = "game-zips";

export const initZIPsDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB is only supported in a browser context"));
      return;
    }
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

export const saveGameZIP = async (gameId: string, zipBlob: Blob): Promise<void> => {
  const db = await initZIPsDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(zipBlob, gameId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getGameZIP = async (gameId: string): Promise<Blob | null> => {
  const db = await initZIPsDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(gameId);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

export const deleteGameZIP = async (gameId: string): Promise<void> => {
  const db = await initZIPsDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(gameId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

