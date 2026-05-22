"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Maximize2,
  ChevronDown,
  ArrowUp,
  Calendar,
  Cpu,
  Laptop,
  ArrowLeft,
  Check,
  Gamepad,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import JSZip from "jszip";
import { GameData, getGamesDB, submitVoteDB, getGameZIP } from "@/utils/db";
import { GameTile } from "@/components/ui/GameTile";

interface GamePlayViewProps {
  gameId: string;
  onBackToHome: () => void;
  onSelectGame: (id: string) => void;
}

export function GamePlayView({ gameId, onBackToHome, onSelectGame }: GamePlayViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [game, setGame] = useState<GameData | null>(null);
  const [suggestions, setSuggestions] = useState<GameData[]>([]);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [activeFAQIndex, setActiveFAQIndex] = useState<number | null>(0);

  // ZIP Game client runtime states
  const [zipIframeUrl, setZipIframeUrl] = useState<string | null>(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const objectUrlsRef = useRef<string[]>([]);

  // Sync / load active game & recommendations
  useEffect(() => {
    const allGames = getGamesDB();
    const active = allGames.find((g) => g.id === gameId);
    if (active) {
      setGame(active);
      // Filter suggestions: same genre or trending, max 6 items
      const filtered = allGames
        .filter((g) => g.id !== gameId)
        .sort((a, b) => {
          if (a.genre === active.genre && b.genre !== active.genre) return -1;
          if (a.genre !== active.genre && b.genre === active.genre) return 1;
          return parseFloat(b.plays) - parseFloat(a.plays);
        })
        .slice(0, 6);
      setSuggestions(filtered);
    }
    // Scroll to top when loading new game
    window.scrollTo({ top: 0, behavior: "instant" as any });
  }, [gameId]);

  // Handle client-side HTML5 game ZIP unzipping
  useEffect(() => {
    // Revoke all previous blob URLs
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
    setZipIframeUrl(null);
    setZipLoading(false);
    setZipError(null);

    if (!game || !game.isZipGame) return;

    let isSubscribed = true;
    setZipLoading(true);

    const loadAndExtractZip = async () => {
      try {
        const zipBlob = await getGameZIP(game.id);
        if (!zipBlob) {
          throw new Error("Could not find game ZIP package in browser storage. Please upload again.");
        }

        if (!isSubscribed) return;

        const jszip = new JSZip();
        const zip = await jszip.loadAsync(zipBlob);

        // Find index.html recursively, ignoring macOS metadata folders & dotfiles
        const fileNames = Object.keys(zip.files);
        const indexPath = fileNames.find((name) => {
          const lower = name.toLowerCase();
          return lower.endsWith("index.html") && !lower.includes("__macosx") && !name.split("/").pop()?.startsWith("._");
        });

        if (!indexPath) {
          throw new Error("Could not find the entrypoint file 'index.html' inside the ZIP package.");
        }

        // Calculate the base directory of the entrypoint file (if any)
        const baseDir = indexPath.includes("/") ? indexPath.substring(0, indexPath.lastIndexOf("/") + 1) : "";

        const pathMap: Record<string, string> = {};

        // Extract each file as a Blob with its correct MIME type
        const getMimeType = (fileName: string): string => {
          const ext = fileName.split(".").pop()?.toLowerCase();
          switch (ext) {
            case "html": case "htm": return "text/html";
            case "js": return "application/javascript";
            case "css": return "text/css";
            case "png": return "image/png";
            case "jpg": case "jpeg": return "image/jpeg";
            case "gif": return "image/gif";
            case "svg": return "image/svg+xml";
            case "json": return "application/json";
            case "mp3": return "audio/mpeg";
            case "ogg": return "audio/ogg";
            case "wav": return "audio/wav";
            case "wasm": return "application/wasm";
            case "txt": return "text/plain";
            default: return "application/octet-stream";
          }
        };

        // Extract non-html files first to build our lookup table, ignoring macOS metadata files
        const extractionPromises = fileNames
          .filter((name) => {
            const isDir = zip.files[name].dir;
            const isMeta = name.toLowerCase().includes("__macosx") || name.split("/").pop()?.startsWith("._");
            return !isDir && !isMeta && name !== indexPath;
          })
          .map(async (name) => {
            const file = zip.files[name];
            const mimeType = getMimeType(name);
            const content = await file.async("blob");
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            if (isSubscribed) {
              objectUrlsRef.current.push(url);
              
              // 1. Original ZIP name reference
              pathMap[name] = url;
              
              // 2. Normalized path reference (forward slashes)
              const normalized = name.replace(/\\/g, "/");
              pathMap[normalized] = url;
              pathMap[`./${normalized}`] = url;

              // 3. Nested relative reference (if index.html is located in a subfolder)
              if (baseDir && normalized.startsWith(baseDir)) {
                const relativeToHtml = normalized.substring(baseDir.length);
                pathMap[relativeToHtml] = url;
                pathMap[`./${relativeToHtml}`] = url;
              }
            }
          });

        await Promise.all(extractionPromises);

        if (!isSubscribed) return;

        // Read index.html as text
        const indexFile = zip.files[indexPath];
        let indexText = await indexFile.async("text");

        // Inject the fetch/XHR/Element/Worker Interceptor script at the very top of <head>/<html>
        // It intercepts relative network requests and serves them from our pathMap!
        const interceptorScript = `
          <script id="zylo-sandbox-interceptor">
            (function() {
              const pathMap = ${JSON.stringify(pathMap)};
              const blobUrls = new Set(Object.values(pathMap));
              
              // Helper to resolve relative path
              function resolvePath(url) {
                if (!url) return url;
                
                // 1. If it's already a resolved Blob URL, return directly
                if (blobUrls.has(url)) return url;
                
                // Strip hash and query params
                let cleanUrl = url.split('#')[0].split('?')[0];
                
                // 2. Identify prefixes to strip (browser-resolved absolute paths in blob iframe)
                const origin = window.location.origin;
                const blobPrefix = 'blob:' + origin + '/';
                const originPrefix = origin + '/';
                
                let relative = cleanUrl;
                if (relative.startsWith(blobPrefix)) {
                  relative = relative.substring(blobPrefix.length);
                } else if (relative.startsWith(originPrefix)) {
                  relative = relative.substring(originPrefix.length);
                }
                
                // 3. Direct pathMap lookup
                if (pathMap[relative]) return pathMap[relative];
                
                // 4. Try with leading './' removed
                let noDot = relative.replace(/^\\.\\//, '');
                if (pathMap[noDot]) return pathMap[noDot];
                
                // 5. Try decoding URI encoded characters
                try {
                  let decoded = decodeURIComponent(relative);
                  if (pathMap[decoded]) return pathMap[decoded];
                  let decodedNoDot = decoded.replace(/^\\.\\//, '');
                  if (pathMap[decodedNoDot]) return pathMap[decodedNoDot];
                } catch (e) {}
                
                // 6. Fallback suffix matching as a last resort
                for (const key in pathMap) {
                  if (relative.endsWith(key) || key.endsWith(relative)) {
                    return pathMap[key];
                  }
                }
                
                return url;
              }

              // Intercept Fetch API
              const originalFetch = window.fetch;
              window.fetch = function(input, init) {
                let url = typeof input === 'string' ? input : (input instanceof Request ? input.url : '');
                const resolved = resolvePath(url);
                if (resolved !== url) {
                  if (input instanceof Request) {
                    input = new Request(resolved, input);
                  } else {
                    input = resolved;
                  }
                }
                return originalFetch.call(this, input, init);
              };

              // Intercept XMLHttpRequest
              const originalOpen = XMLHttpRequest.prototype.open;
              XMLHttpRequest.prototype.open = function(method, url, ...args) {
                const resolved = resolvePath(url);
                return originalOpen.call(this, method, resolved, ...args);
              };

              // Intercept dynamic scripts and frames created using element.setAttribute
              try {
                const originalSetAttribute = Element.prototype.setAttribute;
                Element.prototype.setAttribute = function(name, value) {
                  if (typeof name === 'string' && ['src', 'href', 'data'].includes(name.toLowerCase())) {
                    value = resolvePath(value);
                  }
                  return originalSetAttribute.call(this, name, value);
                };
              } catch (e) {
                console.warn("Failed to override Element.prototype.setAttribute", e);
              }

              // Intercept Web Workers created relative to the iframe
              try {
                const OriginalWorker = window.Worker;
                window.Worker = function(scriptURL, options) {
                  const resolved = resolvePath(scriptURL);
                  return new OriginalWorker(resolved, options);
                };
                window.Worker.prototype = OriginalWorker.prototype;
              } catch (e) {
                console.warn("Failed to override window.Worker", e);
              }

              // Safely override DOM element prototype setters to intercept dynamic mutations walking prototype chain
              function safeOverride(proto, prop) {
                try {
                  let desc = undefined;
                  let currentProto = proto;
                  while (currentProto && !desc) {
                    desc = Object.getOwnPropertyDescriptor(currentProto, prop);
                    if (!desc) {
                      currentProto = Object.getPrototypeOf(currentProto);
                    }
                  }
                  
                  if (desc && desc.set) {
                    const originalSet = desc.set;
                    const originalGet = desc.get;
                    Object.defineProperty(currentProto, prop, {
                      set: function(val) {
                        const resolved = resolvePath(val);
                        originalSet.call(this, resolved);
                      },
                      get: function() {
                        return originalGet.call(this);
                      },
                      configurable: true,
                      enumerable: true
                    });
                  } else {
                    Object.defineProperty(proto, prop, {
                      set: function(val) {
                        this.setAttribute(prop, resolvePath(val));
                      },
                      get: function() {
                        return this.getAttribute(prop);
                      },
                      configurable: true,
                      enumerable: true
                    });
                  }
                } catch (e) {
                  console.warn("Failed to override property:", prop, e);
                }
              }

              safeOverride(HTMLImageElement.prototype, 'src');
              safeOverride(HTMLScriptElement.prototype, 'src');
              safeOverride(HTMLLinkElement.prototype, 'href');
              safeOverride(HTMLAudioElement.prototype, 'src');
              safeOverride(HTMLSourceElement.prototype, 'src');
            })();
          </script>
        `;

        // Insert interceptor script at the most robust location in HTML structure
        let inserted = false;
        const headTag = indexText.match(/<head[^>]*>/i);
        if (headTag) {
          const insertIdx = headTag.index! + headTag[0].length;
          indexText = indexText.slice(0, insertIdx) + "\n" + interceptorScript + indexText.slice(insertIdx);
          inserted = true;
        }

        if (!inserted) {
          const htmlTag = indexText.match(/<html[^>]*>/i);
          if (htmlTag) {
            const insertIdx = htmlTag.index! + htmlTag[0].length;
            indexText = indexText.slice(0, insertIdx) + "\n" + interceptorScript + indexText.slice(insertIdx);
            inserted = true;
          }
        }

        if (!inserted) {
          const docTypeTag = indexText.match(/<!DOCTYPE\s+html[^>]*>/i);
          if (docTypeTag) {
            const insertIdx = docTypeTag.index! + docTypeTag[0].length;
            indexText = indexText.slice(0, insertIdx) + "\n" + interceptorScript + indexText.slice(insertIdx);
            inserted = true;
          }
        }

        if (!inserted) {
          indexText = interceptorScript + indexText;
        }

        // Walk the indexText and replace static relative paths in script, link, img, audio, video elements!
        // Resiliently handles quotes (double, single, none), query parameters, and hashes.
        for (const [relativePath, blobUrl] of Object.entries(pathMap)) {
          const escapedPath = relativePath.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\\\$&");
          
          const attrRegex = new RegExp(`(src|href|value|data)\\s*=\\s*(["']?)(\\\\.\\\\/|\\\\/)?${escapedPath}(\\\\?[^"'>\\s]*)?(#[^"'>\\s]*)?\\\\2`, "gi");
          indexText = indexText.replace(attrRegex, `$1="${blobUrl}"`);

          const urlRegex = new RegExp(`url\\s*\\(\\s*['"]?(\\\\.\\\\/|\\\\/)?${escapedPath}(\\\\?[^'")]*)?(#[^'")]*)?['"]?\\s*\\)`, "gi");
          indexText = indexText.replace(urlRegex, `url("${blobUrl}")`);
        }

        // Create Blob for modified index.html
        const indexBlob = new Blob([indexText], { type: "text/html" });
        const finalUrl = URL.createObjectURL(indexBlob);
        
        if (isSubscribed) {
          objectUrlsRef.current.push(finalUrl);
          
          // Map index.html references to finalUrl as well so dynamic menu/reloads inside sandbox work
          pathMap[indexPath] = finalUrl;
          const normalizedIndex = indexPath.replace(/\\/g, "/");
          pathMap[normalizedIndex] = finalUrl;
          pathMap[`./${normalizedIndex}`] = finalUrl;
          if (baseDir && normalizedIndex.startsWith(baseDir)) {
            const relativeIndex = normalizedIndex.substring(baseDir.length);
            pathMap[relativeIndex] = finalUrl;
            pathMap[`./${relativeIndex}`] = finalUrl;
          }

          setZipIframeUrl(finalUrl);
          setZipLoading(false);
        }
      } catch (err: any) {
        console.error("ZIP uncompress loading failed:", err);
        if (isSubscribed) {
          setZipError(err.message || "Failed to unpack and run game ZIP package.");
          setZipLoading(false);
        }
      }
    };

    loadAndExtractZip();

    return () => {
      isSubscribed = false;
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current = [];
    };
  }, [gameId, game?.id]);

  // Handle vertical window scroll state
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollBtn(true);
      } else {
        setShowScrollBtn(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!game) return null;

  // Votes & ratings calculations
  const totalVotes = game.likes + game.dislikes;
  const ratingPercentage = totalVotes > 0 ? Math.round((game.likes / totalVotes) * 100) : 100;

  const handleVote = (voteType: "like" | "dislike") => {
    const updated = submitVoteDB(game.id, voteType);
    if (updated) {
      setGame(updated);
    }
  };

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      } else if ((iframeRef.current as any).webkitRequestFullscreen) {
        (iframeRef.current as any).webkitRequestFullscreen();
      } else if ((iframeRef.current as any).msRequestFullscreen) {
        (iframeRef.current as any).msRequestFullscreen();
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  const scrollToGame = () => {
    containerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative w-full text-white pb-16">
      {/* Floating Share Link Toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple border border-white/20 shadow-[0_10px_30px_rgba(0,240,255,0.4)] flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-white" />
            <span className="text-sm font-bold tracking-wider">GAME LINK COPIED TO CLIPBOARD!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Back to Game Button */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToGame}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-electric-blue text-white shadow-[0_0_20px_rgba(0,240,255,0.5)] border border-white/10 hover:brightness-110 font-heading font-black text-xs uppercase tracking-widest transition-all"
          >
            <ArrowUp className="w-4 h-4 animate-bounce" />
            Back to Game
          </motion.button>
        )}
      </AnimatePresence>

      {/* Back Header Nav bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-white transition-colors group py-1.5"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Homepage
        </button>
        <div className="flex items-center gap-2 text-xs font-mono text-white/40">
          <span>Zylo Arcade</span>
          <span>•</span>
          <span className="text-electric-blue">{game.genre}</span>
          <span>•</span>
          <span>{game.plays} Plays</span>
        </div>
      </div>

      {/* Game Layout Block */}
      <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CENTER VIEWPORT (8 cols in LG) */}
        <div className="lg:col-span-8 flex flex-col">
          {/* High-End Iframe Viewport Frame */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/[0.08] shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-20 group">
            {/* Screen static scanner overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px] opacity-10 pointer-events-none z-10" />
            
            {zipLoading && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-30">
                <div className="w-12 h-12 rounded-full border-2 border-t-electric-blue border-r-neon-purple border-b-white/10 border-l-white/10 animate-spin shadow-[0_0_15px_rgba(0,240,255,0.3)]" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-heading font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-neon-purple">
                    Unpacking Game Resources
                  </span>
                  <span className="text-[10px] text-white/40 font-mono tracking-wider animate-pulse">
                    Extracting virtual assets & initializing sandbox...
                  </span>
                </div>
              </div>
            )}

            {zipError && (
              <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-30 p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-center gap-2 max-w-sm">
                  <span className="text-sm font-heading font-black tracking-widest uppercase text-red-400">
                    Failed to Load Game
                  </span>
                  <span className="text-xs text-white/50 leading-relaxed font-mono">
                    {zipError}
                  </span>
                </div>
              </div>
            )}

            {(!game.isZipGame || zipIframeUrl) && (
              <iframe
                ref={iframeRef}
                src={game.isZipGame ? zipIframeUrl! : game.iframeUrl}
                className="w-full h-full border-none relative z-0"
                allow="autoplay; fullscreen; keyboard"
                title={game.title}
              />
            )}
          </div>

          {/* Action Toolbar directly under Frame */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#07070a] border border-white/[0.05] relative z-20">
            {/* Left toolbar: Title & rating percentage */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <h1 className="text-xl font-heading font-black text-white uppercase italic tracking-wider leading-none">
                  {game.title}
                </h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs font-semibold text-white/40 font-mono">{game.developer}</span>
                  <span className="text-xs text-white/20">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 font-mono">{ratingPercentage}% Rating</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right toolbar: Toolbar feedback actions */}
            <div className="flex items-center gap-2">
              {/* Like / Dislike Button Groups */}
              <div className="flex items-center rounded-lg bg-white/[0.04] p-0.5 border border-white/[0.06]">
                <button
                  onClick={() => handleVote("like")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all text-xs font-semibold ${
                    game.userVote === "like"
                      ? "bg-emerald-500/20 text-emerald-400 shadow-inner"
                      : "text-white/40 hover:text-white/80 hover:bg-white/[0.03]"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span className="font-mono">{game.likes}</span>
                </button>
                <div className="w-[1px] h-4 bg-white/10" />
                <button
                  onClick={() => handleVote("dislike")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all text-xs font-semibold ${
                    game.userVote === "dislike"
                      ? "bg-red-500/20 text-red-400 shadow-inner"
                      : "text-white/40 hover:text-white/80 hover:bg-white/[0.03]"
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span className="font-mono">{game.dislikes}</span>
                </button>
              </div>

              {/* Share Trigger */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all text-xs font-bold tracking-wide"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>

              {/* Fullscreen Trigger */}
              <button
                onClick={handleFullscreen}
                className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all"
                title="Fullscreen Mode"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* SIDE SUGGESTIONS BAR (4 cols in LG) */}
        <div className="lg:col-span-4 flex flex-col h-full bg-[#050508]/40 border border-white/[0.04] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/[0.05]">
            <Gamepad className="w-4 h-4 text-electric-blue" />
            <h3 className="text-sm font-heading font-black tracking-wider uppercase">
              Play Next Suggestions
            </h3>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto max-h-[480px] custom-scrollbar pr-1">
            {suggestions.map((sug, idx) => (
              <div key={sug.id} onClick={() => onSelectGame(sug.id)}>
                <GameTile game={sug} index={idx} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deep details and FAQs row */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Specification and Game details columns (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          
          {/* Segment 1: Technical Specs Overview */}
          <section className="p-6 rounded-2xl bg-[#07070a]/60 border border-white/[0.04] backdrop-blur-xl">
            <h2 className="text-lg font-heading font-black tracking-wider uppercase mb-5 text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-neon-cyan">
              Technical Specifications
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-10 h-10 rounded-lg bg-electric-blue/10 flex items-center justify-center text-electric-blue">
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/30 uppercase font-mono">Technology</span>
                  <span className="text-xs font-bold text-white/80">{game.technology || "HTML5 (WebGL)"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-10 h-10 rounded-lg bg-neon-purple/10 flex items-center justify-center text-neon-purple">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/30 uppercase font-mono">Release Date</span>
                  <span className="text-xs font-bold text-white/80">{game.releaseDate || "March 2025"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-10 h-10 rounded-lg bg-neon-pink/10 flex items-center justify-center text-neon-pink">
                  <Laptop className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/30 uppercase font-mono">Platforms</span>
                  <span className="text-xs font-bold text-white/80">
                    {game.platforms?.join(", ") || "Browser (Desktop, Mobile)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description details */}
            <div className="mt-6 pt-5 border-t border-white/[0.05]">
              <span className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] block mb-2 font-mono">
                Gameplay Overview
              </span>
              <p className="text-sm text-white/60 leading-relaxed font-medium">
                {game.description}
              </p>
            </div>
          </section>

          {/* Segment 2: Walkthrough Video Clips */}
          {game.gameplayVideos && game.gameplayVideos.length > 0 && (
            <section className="p-6 rounded-2xl bg-[#07070a]/60 border border-white/[0.04] backdrop-blur-xl">
              <div className="flex items-center gap-2.5 mb-5">
                <Sparkles className="w-4 h-4 text-neon-purple" />
                <h2 className="text-lg font-heading font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink">
                  Gameplay Videos & Walkthroughs
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {game.gameplayVideos.map((video, idx) => (
                  <div key={idx} className="flex flex-col gap-2">
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/[0.06] shadow-md">
                      <iframe
                        src={video.videoUrl || undefined}
                        className="w-full h-full border-none"
                        allowFullScreen
                        title={video.title}
                      />
                    </div>
                    <span className="text-xs font-bold text-white/60 font-sans tracking-wide">
                      {video.title}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Segment 3: Accordion FAQs */}
          {game.faqs && game.faqs.length > 0 && (
            <section className="p-6 rounded-2xl bg-[#07070a]/60 border border-white/[0.04] backdrop-blur-xl">
              <h2 className="text-lg font-heading font-black tracking-wider uppercase mb-5 text-transparent bg-clip-text bg-gradient-to-r from-[#ff9f0a] to-[#ff5e00]">
                Frequently Asked Questions
              </h2>

              <div className="flex flex-col gap-3">
                {game.faqs.map((faq, idx) => {
                  const isOpen = activeFAQIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl bg-white/[0.01] border border-white/[0.04] overflow-hidden"
                    >
                      <button
                        onClick={() => setActiveFAQIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-white/[0.03]"
                      >
                        <span className="text-sm font-bold text-white/80">{faq.question}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-white/40 transition-transform duration-300 ${
                            isOpen ? "rotate-180 text-electric-blue" : ""
                          }`}
                        />
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <div className="p-4 pt-0 text-xs text-white/50 leading-relaxed border-t border-white/[0.02]">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Sticky side specs dashboard widget (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-24">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#07070a]/80 to-[#0c0c14]/40 border border-white/[0.06] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-electric-blue/10 to-transparent blur-xl" />
            
            <h3 className="text-sm font-heading font-black tracking-widest uppercase mb-4 text-white/70">
              Developer Info
            </h3>

            <div className="flex flex-col gap-3.5">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-white/[0.04]">
                <span className="text-white/30 font-semibold uppercase tracking-wider">Developer</span>
                <span className="font-bold text-white/80">{game.developer}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-white/[0.04]">
                <span className="text-white/30 font-semibold uppercase tracking-wider">Rating</span>
                <span className="font-bold text-yellow-400 font-mono flex items-center gap-1">
                  ★ {game.rating}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-white/[0.04]">
                <span className="text-white/30 font-semibold uppercase tracking-wider">Total Plays</span>
                <span className="font-bold text-white/80 font-mono">{game.plays}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/30 font-semibold uppercase tracking-wider font-mono">Genre</span>
                <span className="px-2 py-0.5 bg-electric-blue/10 border border-electric-blue/20 text-electric-blue text-[10px] font-extrabold uppercase rounded font-mono">
                  {game.genre}
                </span>
              </div>
            </div>

            <button
              onClick={scrollToGame}
              className="mt-6 w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white font-heading font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-[0_4px_15px_rgba(0,240,255,0.2)] transition-all cursor-pointer"
            >
              Play Frame Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
