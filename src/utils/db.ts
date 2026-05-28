import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject, getBlob } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

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
  portraitBackground?: string;
  previewVideo?: string;
  genre: string;
  tags: string[];
  rating: number;
  plays: string;
  isNew?: boolean;
  isHot?: boolean;
  isFeatured?: boolean;
  isHero?: boolean;
  developer: string;
  description: string;
  iframeUrl: string;
  gameplayVideos?: GameplayVideo[];
  faqs?: FAQItem[];
  likes: number;
  dislikes: number;
  userVote?: "like" | "dislike" | null;
  accentColor?: string;
  buttonGradient?: string;
  releaseDate?: string;
  technology?: string;
  platforms?: string[];
  isZipGame?: boolean;
  zipSize?: string | null;
  zipUrl?: string | null;
  isPortrait?: boolean;
  aspectRatio?: "16:9" | "9:16" | "3:4" | "2:3";
}

export const getGamesDB = async (): Promise<GameData[]> => {
  try {
    // Attempt Firestore fetch with a 4-second timeout to prevent network hang/blocking on mobile
    const querySnapshot = await Promise.race([
      getDocs(collection(db, "games")),
      new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Firestore timeout")), 4000))
    ]);
    const games: GameData[] = [];
    querySnapshot.forEach((document: any) => {
      games.push(document.data() as GameData);
    });
    if (games.length > 0) {
      if (typeof window !== "undefined") {
        localStorage.setItem("zylo_games_cache", JSON.stringify(games));
      }
      return games;
    }
  } catch (err) {
    console.warn("Firestore fetch failed or timed out. Falling back to cache/mock data...", err);
  }

  // Attempt local storage cache retrieval
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("zylo_games_cache");
      if (cached) {
        const parsed = JSON.parse(cached) as GameData[];
        if (parsed.length > 0) {
          console.log("Loaded games from local cache.");
          return parsed;
        }
      }
    } catch {}
  }

  // Offline fallback premium seed games (guarantees content renders in restricted environments)
  console.log("Loaded offline fallback seed games.");
  return [
    {
      id: "g-raccoon-rescue",
      title: "Raccoon Rescue",
      slug: "raccoon-rescue",
      thumbnail: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80",
      genre: "Puzzle",
      tags: ["Bubble Shooter", "Match 3", "Casual"],
      rating: 4.8,
      plays: "1.2M",
      isHot: true,
      isHero: true,
      isFeatured: true,
      developer: "ZyloGames",
      description: "Help the cute raccoon save its babies by matching colorful bubbles and shooting them! High-octane arcade action with hundreds of levels, powerful boosters, and gorgeous graphics.",
      iframeUrl: "https://html5.gamedistribution.com/8a64861cb70743b1858c9735d4fa3220/",
      likes: 1200,
      dislikes: 45
    },
    {
      id: "g-ludo-hero",
      title: "Ludo Hero",
      slug: "ludo-hero",
      thumbnail: "https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=400&q=80",
      banner: "https://images.unsplash.com/photo-1585504198199-20277593b94f?w=1200&q=80",
      genre: "Strategy",
      tags: ["Board", "Multiplayer", "Strategy"],
      rating: 4.6,
      plays: "890K",
      isHot: true,
      isHero: true,
      developer: "BoardKings",
      description: "Play Ludo Hero online with real players around the world or challenge smart computer AI. Roll the dice and move your tokens strategically to reach the center of the board first!",
      iframeUrl: "https://html5.gamedistribution.com/0acc7fdf55eb3220/",
      likes: 950,
      dislikes: 38
    }
  ];
};

const removeUndefined = (obj: any): any => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  }
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (val !== undefined) {
        result[key] = removeUndefined(val);
      }
    }
  }
  return result;
};

export const addGameDB = async (game: Omit<GameData, "id" | "likes" | "dislikes">): Promise<GameData> => {
  const newGame: GameData = {
    ...game,
    id: `g-${Date.now()}`,
    likes: 0,
    dislikes: 0
  };
  await setDoc(doc(db, "games", newGame.id), removeUndefined(newGame));
  return newGame;
};

export const updateGameDB = async (updatedGame: GameData): Promise<void> => {
  await setDoc(doc(db, "games", updatedGame.id), removeUndefined(updatedGame), { merge: true });
};

export const deleteGameDB = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "games", id));
  // Cascade clean-up ZIP binaries from Firebase Storage
  await deleteGameZIP(id).catch((err) => {
    console.warn("Failed to purge game ZIP from Storage (maybe it was just a URL game):", err);
  });
};

export const toggleHeroDB = async (id: string): Promise<{ success: boolean; message: string }> => {
  const games = await getGamesDB();
  const game = games.find((g) => g.id === id);
  if (!game) return { success: false, message: "Game not found." };

  const currentHeroCount = games.filter((g) => g.isHero).length;
  const isCurrentlyHero = game.isHero;

  if (!isCurrentlyHero && currentHeroCount >= 4) {
    return {
      success: false,
      message: "Strict limit reached: You can select exactly up to 4 games for the Hero Slider. Please deselect a game first."
    };
  }

  await updateDoc(doc(db, "games", id), removeUndefined({
    isHero: !isCurrentlyHero
  }));
  
  return {
    success: true,
    message: !isCurrentlyHero ? "Added to Hero Slider." : "Removed from Hero Slider."
  };
};

export const submitVoteDB = async (id: string, voteType: "like" | "dislike"): Promise<GameData | null> => {
  const gameDoc = await getDoc(doc(db, "games", id));
  if (!gameDoc.exists()) return null;
  const game = gameDoc.data() as GameData;
  const previousVote = game.userVote;

  if (previousVote === voteType) {
    if (voteType === "like") game.likes = Math.max(0, game.likes - 1);
    else game.dislikes = Math.max(0, game.dislikes - 1);
    game.userVote = null;
  } else {
    if (previousVote) {
      if (previousVote === "like") game.likes = Math.max(0, game.likes - 1);
      else game.dislikes = Math.max(0, game.dislikes - 1);
    }
    if (voteType === "like") game.likes += 1;
    else game.dislikes += 1;
    game.userVote = voteType;
  }

  await updateDoc(doc(db, "games", id), removeUndefined({
    likes: game.likes,
    dislikes: game.dislikes,
    userVote: game.userVote || null
  }));
  return game;
};

// ==========================================
// FIREBASE CLOUD STORAGE FOR GAME ZIPS
// ==========================================

export const saveGameZIP = async (gameId: string, zipBlob: Blob): Promise<void> => {
  const storageRef = ref(storage, `games/${gameId}.zip`);
  await uploadBytes(storageRef, zipBlob);
};

// Fetch game ZIP with direct-first strategy for maximum speed.
// Direct fetch (single-hop, no proxy overhead) is attempted first.
// Falls back to Edge streaming proxy only if direct fetch fails (CORS block on some mobile browsers).
export const getGameZIP = async (zipUrl: string): Promise<Blob | null> => {
  // Strategy 1: Direct fetch (fastest — single hop, no proxy)
  try {
    const directResponse = await fetch(zipUrl, { mode: "cors" });
    if (directResponse.ok) {
      return await directResponse.blob();
    }
  } catch {
    // CORS or network error — fall through to proxy
  }

  // Strategy 2: Edge streaming proxy (still fast — streams without buffering)
  try {
    const proxyUrl = `/api/proxy-zip?url=${encodeURIComponent(zipUrl)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch game ZIP: ${response.statusText}`);
    }
    return await response.blob();
  } catch (err: any) {
    console.error("ZIP fetch error:", err);
    throw err;
  }
};

export const deleteGameZIP = async (gameId: string): Promise<void> => {
  const storageRef = ref(storage, `games/${gameId}.zip`);
  await deleteObject(storageRef);
};
