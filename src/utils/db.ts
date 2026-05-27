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
  const querySnapshot = await getDocs(collection(db, "games"));
  const games: GameData[] = [];
  querySnapshot.forEach((document) => {
    games.push(document.data() as GameData);
  });
  return games;
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

// We now fetch the ZIP file from the public UploadThing URL provided in the game data
export const getGameZIP = async (zipUrl: string): Promise<Blob | null> => {
  try {
    const response = await fetch(zipUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch game ZIP from remote storage");
    }
    return await response.blob();
  } catch (err: any) {
    console.error("UploadThing ZIP fetch error:", err);
    throw err;
  }
};

export const deleteGameZIP = async (gameId: string): Promise<void> => {
  const storageRef = ref(storage, `games/${gameId}.zip`);
  await deleteObject(storageRef);
};
