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
  AlertTriangle,
  EyeOff,
  Heart,
  MessageSquare,
  Minimize2,
  Smartphone,
  ChevronUp,
  X,
  LogOut
} from "lucide-react";
import JSZip from "jszip";
import { GameData, getGamesDB, submitVoteDB, getGameZIP } from "@/utils/db";
import { GameTile } from "@/components/ui/GameTile";

interface GamePlayViewProps {
  gameId: string;
  onBackToHome: () => void;
  onSelectGame: (id: string) => void;
}

const getSecureIframeUrl = (url: string) => {
  if (!url) return "";
  if (typeof window !== "undefined" && window.location.protocol === "https:" && url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }
  return url;
};

export function GamePlayView({ gameId, onBackToHome, onSelectGame }: GamePlayViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerFrameRef = useRef<HTMLDivElement>(null);

  const [game, setGame] = useState<GameData | null>(null);
  const [suggestions, setSuggestions] = useState<GameData[]>([]);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [activeFAQIndex, setActiveFAQIndex] = useState<number | null>(0);

  // Cinematic Gameplay & Custom Toolbar States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBarHidden, setIsBarHidden] = useState(false);
  const [isPortraitOverride, setIsPortraitOverride] = useState<boolean | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isDevicePortrait, setIsDevicePortrait] = useState(true);

  // Dynamically monitor screen dimensions to support native rotations
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsDevicePortrait(window.innerWidth < window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  // Sync ref to avoid stale closures in background ZIP prefetch effect
  const hasStartedRef = useRef(hasStarted);
  useEffect(() => {
    hasStartedRef.current = hasStarted;
  }, [hasStarted]);

  const [showEscToast, setShowEscToast] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showReportToast, setShowReportToast] = useState(false);

  // ZIP Game client runtime states
  const [zipIframeUrl, setZipIframeUrl] = useState<string | null>(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);

  // Iframe load state
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const objectUrlsRef = useRef<string[]>([]);
  // Cache refs for background-prefetched ZIP — allows instant game start when user taps PLAY
  const zipUrlCacheRef = useRef<string | null>(null);

  // Detect mobile once on mount (client-side only)
  useEffect(() => {
    const mobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobileDevice(mobile);
  }, []);

  // No JS measurement needed — we use pure CSS env(safe-area-inset-top) directly
  // in the JSX styles below. The browser provides the exact pixel-perfect value
  // for every device's notch/punch-hole/camera cutout dynamically.

  // Lock body scroll when in mobile fullscreen to prevent background page scrolling
  useEffect(() => {
    if (isMobileDevice && isFullscreen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMobileDevice, isFullscreen]);

  // Sync / load active game & recommendations
  useEffect(() => {
    const isMobile = typeof window !== "undefined" && (window.innerWidth < 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent));
    setHasStarted(!isMobile);
    setIsIframeLoaded(false);
    const fetchGame = async () => {
      try {
        const allGames = await getGamesDB();
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
      } catch (err) {
        console.error("Failed to fetch game details from Firebase", err);
      }
    };

    fetchGame();
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

    // Reset caches for the new game
    zipUrlCacheRef.current = null;

    let isSubscribed = true;
    // Only show spinner if user already tapped PLAY — otherwise prefetch silently in background
    if (hasStarted) setZipLoading(true);

    const loadAndExtractZip = async () => {
      try {
        if (!game.zipUrl) {
          throw new Error("No ZIP URL found for this game. Please re-upload the ZIP file via the Admin Dashboard.");
        }

        if (!isSubscribed) return;

        const t0 = performance.now();
        console.log("Downloading ZIP...", game.zipUrl);
        const zipBlob = await getGameZIP(game.zipUrl);
        if (!zipBlob) {
          throw new Error("Could not download game ZIP package.");
        }
        console.log(`ZIP downloaded in ${((performance.now() - t0) / 1000).toFixed(1)}s (${(zipBlob.size / 1024 / 1024).toFixed(1)}MB)`);

        const t1 = performance.now();
        const zip = await Promise.race([
          new JSZip().loadAsync(zipBlob),
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error("ZIP parsing timed out.")), 60000))
        ]);
        console.log(`ZIP parsed in ${((performance.now() - t1) / 1000).toFixed(1)}s`);

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

        // Filter extractable files (skip dirs, macOS metadata, index.html)
        const filesToExtract = fileNames.filter((name) => {
          const isDir = zip.files[name].dir;
          const isMeta = name.toLowerCase().includes("__macosx") || name.split("/").pop()?.startsWith("._");
          return !isDir && !isMeta && name !== indexPath;
        });

        const t2 = performance.now();

        // Extract all files + index.html concurrently for maximum throughput
        // Use arraybuffer (faster decompression) and create a single typed Blob per file
        const [, indexText] = await Promise.all([
          // Asset extraction — all in parallel
          Promise.all(filesToExtract.map(async (name) => {
            if (!isSubscribed) return;
            const file = zip.files[name];
            const mimeType = getMimeType(name);
            const buffer = await file.async("arraybuffer");
            const url = URL.createObjectURL(new Blob([buffer], { type: mimeType }));
            objectUrlsRef.current.push(url);
            pathMap[name] = url;
            const normalized = name.replace(/\\/g, "/");
            pathMap[normalized] = url;
            pathMap[`./${normalized}`] = url;
            if (baseDir && normalized.startsWith(baseDir)) {
              const relativeToHtml = normalized.substring(baseDir.length);
              pathMap[relativeToHtml] = url;
              pathMap[`./${relativeToHtml}`] = url;
            }
          })),
          // Index.html read — runs concurrently with asset extraction
          zip.files[indexPath].async("text")
        ]);
        console.log(`${filesToExtract.length} files extracted in ${((performance.now() - t2) / 1000).toFixed(1)}s`);

        if (!isSubscribed) return;

        let modifiedIndex = indexText;

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
                
                // Safe URL Casting (resolves TypeError splits on native URL objects)
                if (typeof url !== 'string') {
                  try {
                    url = url.toString();
                  } catch (e) {
                    return url;
                  }
                }
                
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
                
                // 6. Case-insensitive lookup fallback (crucial for filename casing discrepancies)
                const lowerRelative = relative.toLowerCase();
                for (const key in pathMap) {
                  if (key.toLowerCase() === lowerRelative) {
                    return pathMap[key];
                  }
                }
                const lowerNoDot = noDot.toLowerCase();
                for (const key in pathMap) {
                  if (key.toLowerCase() === lowerNoDot) {
                    return pathMap[key];
                  }
                }
                
                // 7. Fallback suffix matching as a last resort
                for (const key in pathMap) {
                  if (relative.endsWith(key) || key.endsWith(relative)) {
                    return pathMap[key];
                  }
                }
                
                return url;
              }

              // Intercept the URL constructor — game engines like Unity WebGL
              // do new URL('./Build/game.data', window.location.href) which fails
              // inside blob: iframes because blob URLs are not valid bases.
              try {
                const OriginalURL = window.URL;
                window.URL = function(url, base) {
                  if (typeof url === 'string') {
                    // 1. Direct pathMap lookup on the raw url
                    var resolved = resolvePath(url);
                    if (resolved !== url) {
                      return new OriginalURL(resolved);
                    }
                    // 2. Strip ./ prefix and try again
                    var stripped = url.replace(/^\\.\\//,'');
                    if (stripped !== url) {
                      var resolvedStripped = resolvePath(stripped);
                      if (resolvedStripped !== stripped) {
                        return new OriginalURL(resolvedStripped);
                      }
                    }
                    // 3. Try just the filename for deep paths
                    var parts = stripped.split('/');
                    if (parts.length > 1) {
                      var filename = parts[parts.length - 1];
                      for (var key in pathMap) {
                        if (key.endsWith('/' + stripped) || key === stripped) {
                          return new OriginalURL(pathMap[key]);
                        }
                      }
                    }
                  }
                  // Fall through to original constructor — wrapped in try-catch
                  // because blob: URLs are not valid bases for relative URL resolution
                  try {
                    if (base !== undefined) {
                      return new OriginalURL(url, base);
                    }
                    return new OriginalURL(url);
                  } catch(e) {
                    // If base was a blob URL that caused the error, try with http origin
                    if (base) {
                      try {
                        var origin = window.location.origin || 'http://localhost:3000';
                        return new OriginalURL(url, origin);
                      } catch(e2) {}
                    }
                    // Last resort: log and construct a best-effort URL
                    console.warn('[ZyloSandbox] URL construction failed for:', url, 'base:', base);
                    try {
                      return new OriginalURL('about:blank');
                    } catch(e3) {
                      throw e; // rethrow original if nothing works
                    }
                  }
                };
                // Preserve static methods and prototype
                window.URL.prototype = OriginalURL.prototype;
                window.URL.createObjectURL = OriginalURL.createObjectURL;
                window.URL.revokeObjectURL = OriginalURL.revokeObjectURL;
                if (OriginalURL.canParse) window.URL.canParse = OriginalURL.canParse;
              } catch(e) {
                console.warn('Failed to override URL constructor', e);
              }

              // Intercept Fetch API
              const originalFetch = window.fetch;
              window.fetch = function(input, init) {
                let url = '';
                if (typeof input === 'string') {
                  url = input;
                } else if (input instanceof URL) {
                  url = input.href;
                } else if (input instanceof Request) {
                  url = input.url;
                } else if (input && typeof input.toString === 'function') {
                  url = input.toString();
                }

                const resolved = resolvePath(url);
                if (resolved && resolved !== url) {
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
                let urlStr = '';
                if (typeof url === 'string') {
                  urlStr = url;
                } else if (url instanceof URL) {
                  urlStr = url.href;
                } else if (url && typeof url.toString === 'function') {
                  urlStr = url.toString();
                }
                const resolved = resolvePath(urlStr);
                return originalOpen.call(this, method, resolved || url, ...args);
              };

              // Intercept document.write & document.writeln to parse and rewrite HTML inline relative paths
              const originalWrite = document.write;
              document.write = function(html) {
                if (typeof html === 'string') {
                  let modifiedHtml = html;
                  for (const [relativePath, blobUrl] of Object.entries(pathMap)) {
                    const escapedPath = relativePath.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\\\$&");
                    const attrRegex = new RegExp('(src|href|value|data)\\\\s*=\\\\s*(["\\\']?)(\\\\.\\\\/|\\\\/)?' + escapedPath + '(\\\\?[^"\\\'>\\\\s]*)?(#[^"\\\'>\\\\s]*)?\\\\2', 'gi');
                    modifiedHtml = modifiedHtml.replace(attrRegex, '$1="' + blobUrl + '"');
                  }
                  return originalWrite.call(this, modifiedHtml);
                }
                return originalWrite.apply(this, arguments);
              };

              const originalWriteln = document.writeln;
              document.writeln = function(html) {
                if (typeof html === 'string') {
                  let modifiedHtml = html;
                  for (const [relativePath, blobUrl] of Object.entries(pathMap)) {
                    const escapedPath = relativePath.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\\\$&");
                    const attrRegex = new RegExp('(src|href|value|data)\\\\s*=\\\\s*(["\\\']?)(\\\\.\\\\/|\\\\/)?' + escapedPath + '(\\\\?[^"\\\'>\\\\s]*)?(#[^"\\\'>\\\\s]*)?\\\\2', 'gi');
                    modifiedHtml = modifiedHtml.replace(attrRegex, '$1="' + blobUrl + '"');
                  }
                  return originalWriteln.call(this, modifiedHtml);
                }
                return originalWriteln.apply(this, arguments);
              };

              // Intercept dynamic scripts and frames created using element.setAttribute
              try {
                const originalSetAttribute = Element.prototype.setAttribute;
                Element.prototype.setAttribute = function(name, value) {
                  if (typeof name === 'string' && ['src', 'href', 'data'].includes(name.toLowerCase())) {
                    let valStr = '';
                    if (typeof value === 'string') {
                      valStr = value;
                    } else if (value instanceof URL) {
                      valStr = value.href;
                    } else if (value && typeof value.toString === 'function') {
                      valStr = value.toString();
                    }
                    value = resolvePath(valStr) || value;
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
                  let urlStr = '';
                  if (typeof scriptURL === 'string') {
                    urlStr = scriptURL;
                  } else if (scriptURL instanceof URL) {
                    urlStr = scriptURL.href;
                  } else if (scriptURL && typeof scriptURL.toString === 'function') {
                    urlStr = scriptURL.toString();
                  }
                  const resolved = resolvePath(urlStr);
                  return new OriginalWorker(resolved || scriptURL, options);
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
                        let valStr = '';
                        if (typeof val === 'string') {
                          valStr = val;
                        } else if (val instanceof URL) {
                          valStr = val.href;
                        } else if (val && typeof val.toString === 'function') {
                          valStr = val.toString();
                        }
                        const resolved = resolvePath(valStr);
                        originalSet.call(this, resolved || val);
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
                        let valStr = '';
                        if (typeof val === 'string') {
                          valStr = val;
                        } else if (val instanceof URL) {
                          valStr = val.href;
                        } else if (val && typeof val.toString === 'function') {
                          valStr = val.toString();
                        }
                        this.setAttribute(prop, resolvePath(valStr) || val);
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

              // Forward wheel scroll event to parent window to enable seamless scrolling on page
              window.addEventListener('wheel', function(e) {
                window.parent.postMessage({ type: 'iframe-scroll', deltaY: e.deltaY }, '*');
              }, { passive: true });
            })();
          </script>
          <style id="zylo-sandbox-canvas-fix">
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              background: #000 !important;
              width: 100% !important;
              height: 100% !important;
            }
            /* Hardware accelerated scaling via object-fit fill */
            canvas {
              width: 100% !important;
              height: 100% !important;
              object-fit: fill !important;
              display: block !important;
              margin: auto !important;
            }
            /* Typical container resets */
            #canvas, #gameContainer, #game-container, #c2canvasdiv, #unity-container {
              width: 100% !important;
              height: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          </style>
          <script id="zylo-universal-scaler">
            (function() {
              if (!document.querySelector('meta[name="viewport"]')) {
                var meta = document.createElement('meta');
                meta.name = 'viewport';
                meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no, viewport-fit=cover';
                (document.head || document.documentElement).appendChild(meta);
              }

              function fixGameElements() {
                var canvases = document.querySelectorAll('canvas');
                for (var i = 0; i < canvases.length; i++) {
                  var c = canvases[i];
                  c.style.setProperty('width', '100%', 'important');
                  c.style.setProperty('height', '100%', 'important');
                  c.style.setProperty('max-width', '100%', 'important');
                  c.style.setProperty('max-height', '100%', 'important');
                  c.style.setProperty('object-fit', 'fill', 'important');
                  c.style.setProperty('display', 'block', 'important');
                  c.style.setProperty('margin', 'auto', 'important');
                }
              }

              fixGameElements();
              window.addEventListener('load', fixGameElements);
              window.addEventListener('resize', fixGameElements);
              var obs = new MutationObserver(fixGameElements);
              if (document.body) obs.observe(document.body, { childList: true, subtree: true });
              else document.addEventListener('DOMContentLoaded', function() {
                obs.observe(document.body, { childList: true, subtree: true });
              });
            })();
          </script>
        `;
        // Insert interceptor script at the most robust location in HTML structure
        let inserted = false;
        const headTag = modifiedIndex.match(/<head[^>]*>/i);
        if (headTag) {
          const insertIdx = headTag.index! + headTag[0].length;
          modifiedIndex = modifiedIndex.slice(0, insertIdx) + "\n" + interceptorScript + modifiedIndex.slice(insertIdx);
          inserted = true;
        }

        if (!inserted) {
          const htmlTag = modifiedIndex.match(/<html[^>]*>/i);
          if (htmlTag) {
            const insertIdx = htmlTag.index! + htmlTag[0].length;
            modifiedIndex = modifiedIndex.slice(0, insertIdx) + "\n" + interceptorScript + modifiedIndex.slice(insertIdx);
            inserted = true;
          }
        }

        if (!inserted) {
          const docTypeTag = modifiedIndex.match(/<!DOCTYPE\s+html[^>]*>/i);
          if (docTypeTag) {
            const insertIdx = docTypeTag.index! + docTypeTag[0].length;
            modifiedIndex = modifiedIndex.slice(0, insertIdx) + "\n" + interceptorScript + modifiedIndex.slice(insertIdx);
            inserted = true;
          }
        }

        if (!inserted) {
          modifiedIndex = interceptorScript + modifiedIndex;
        }

        // Walk the modifiedIndex and replace static relative paths in script, link, img, audio, video elements!
        // Resiliently handles quotes (double, single, none), query parameters, and hashes.
        for (const [relativePath, blobUrl] of Object.entries(pathMap)) {
          const escapedPath = relativePath.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

          const attrRegex = new RegExp("(src|href|value|data)\\s*=\\s*([\"']?)(\\.\\/|\\/)?" + escapedPath + "(\\?[^\"'>\\s]*)?(#[^\"'>\\s]*)?\\2", "gi");
          modifiedIndex = modifiedIndex.replace(attrRegex, `$1="${blobUrl}"`);

          const urlRegex = new RegExp("url\\s*\\(\\s*['\"]?(\\.\\/|\\/)?" + escapedPath + "(\\?[^'\")]*)?(#[^'\")]*)?['\"]?\\s*\\)", "gi");
          modifiedIndex = modifiedIndex.replace(urlRegex, `url("${blobUrl}")`);
        }

        // Create Blob for modified index.html (used universally on both desktop and mobile)
        const indexBlob = new Blob([modifiedIndex], { type: "text/html" });
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

          // Use blob URL universally for both desktop and mobile to leverage browser same-origin caching
          zipUrlCacheRef.current = finalUrl;
          if (hasStartedRef.current) {
            setZipIframeUrl(finalUrl);
          }
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
  // ZIP prefetches in background as soon as game data loads.
  // We removed hasStarted dependency to prevent re-triggering and revoking resources when play starts.
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

  // When user taps PLAY: if ZIP was already prefetched, apply it instantly — zero wait!
  useEffect(() => {
    if (!hasStarted || !game?.isZipGame) return;
    if (zipUrlCacheRef.current && !zipIframeUrl) {
      setZipIframeUrl(zipUrlCacheRef.current);
      setZipLoading(false);
    }
  }, [hasStarted, game?.isZipGame, zipIframeUrl]);

  // Listen for same-origin iframe wheel scroll events to allow seamless page scrolling when hovering the iframe
  useEffect(() => {
    const handleScrollMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "iframe-scroll") {
        if (isFullscreen) return;
        window.scrollBy({
          top: e.data.deltaY,
          behavior: "auto"
        });
      }
    };
    window.addEventListener("message", handleScrollMessage);
    return () => window.removeEventListener("message", handleScrollMessage);
  }, [isFullscreen]);

  // Safety fallback for iframe onLoad event to prevent perpetual spinner
  useEffect(() => {
    if (hasStarted) {
      const timer = setTimeout(() => setIsIframeLoaded(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [hasStarted]);

  // Auto-clear loading overlay when iframe URL is injected
  useEffect(() => {
    if (zipIframeUrl) {
      // Snappy delay for modern browser mounting
      const timer = setTimeout(() => {
        setIsIframeLoaded(true);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [zipIframeUrl]);

  // Handle browser fullscreen changes
  useEffect(() => {
    let escToastTimer: any;
    let barHideTimer: any;
    let focusTimer: any;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (isCurrentlyFullscreen) {
        setShowEscToast(true);
        
        // Lock screen orientation to landscape on mobile devices for landscape games
        if (isMobileDevice && !isPortraitMode) {
          const orientation = (window.screen as any).orientation || (window.screen as any).mozOrientation || (window.screen as any).msOrientation;
          if (orientation && orientation.lock) {
            orientation.lock("landscape").catch((err: any) => {
              console.warn("Screen orientation lock to landscape failed:", err);
            });
          }
        }

        // Auto-hide the premium toolbar after 3 seconds so it does not obstruct the gameplay UI
        barHideTimer = setTimeout(() => {
          setIsBarHidden(true);
        }, 3000);

        // Hide the ESC full screen toast guide after 3 seconds
        escToastTimer = setTimeout(() => {
          setShowEscToast(false);
        }, 3000);

        // Auto-focus the game iframe so that keyboard keys (arrows) work immediately
        focusTimer = setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.focus();
          }
        }, 300);
      } else {
        setShowEscToast(false);
        setIsBarHidden(false); // Reset bar hidden state when exiting fullscreen
        
        // Unlock screen orientation on mobile when exiting fullscreen
        if (isMobileDevice) {
          const orientation = (window.screen as any).orientation || (window.screen as any).mozOrientation || (window.screen as any).msOrientation;
          if (orientation && orientation.unlock) {
            try {
              orientation.unlock();
            } catch (err) {
              console.warn("Screen orientation unlock failed:", err);
            }
          }
        }

        // Re-focus the iframe when returning to regular page view
        focusTimer = setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.focus();
          }
        }, 300);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      clearTimeout(escToastTimer);
      clearTimeout(barHideTimer);
      clearTimeout(focusTimer);
    };
  }, []);

  // Handle keyboard event scroll blocking and Escape key in fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        // Prevent scrolling of parent window when pressing standard game arrow buttons or Spacebar
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.key)) {
          if (iframeRef.current && document.activeElement === iframeRef.current) {
            return;
          }
          e.preventDefault();
          // Ensure game iframe keeps active focus
          if (iframeRef.current && document.activeElement !== iframeRef.current) {
            iframeRef.current.focus();
          }
        }
        
        if (e.key === "Escape") {
          setIsFullscreen(false);
          setIsBarHidden(false);
          if (document.exitFullscreen) document.exitFullscreen().catch(() => { });
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);



  if (!game) return null;

  // Votes & ratings calculations
  const totalVotes = game.likes + game.dislikes;
  const ratingPercentage = totalVotes > 0 ? Math.round((game.likes / totalVotes) * 100) : 100;

  const handleVote = async (voteType: "like" | "dislike") => {
    try {
      const updated = await submitVoteDB(game.id, voteType);
      if (updated) {
        setGame(updated);
      }
    } catch (err) {
      console.error("Failed to submit vote to Firebase", err);
    }
  };

  const handleStartPlay = async () => {
    const mobile = typeof window !== "undefined" && (window.innerWidth < 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    // On mobile: trigger true native HTML5 fullscreen right from the user click interaction to hide address bars
    if (mobile) {
      await handleFullscreen();
    }
    setHasStarted(true);
  };

  const handleFullscreen = async () => {
    const el = playerFrameRef.current as any;
    if (el) {
      try {
        if (el.requestFullscreen) await el.requestFullscreen().catch(() => {});
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
        else if (el.msRequestFullscreen) await el.msRequestFullscreen();
      } catch (err) {
        console.warn("Fullscreen request failed:", err);
      }
      setIsFullscreen(true);
    }
  };

  const handleExitFullscreen = () => {
    try {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => { });
      else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
      else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
    } catch (err) {
      console.warn("Exit fullscreen failed:", err);
    }
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      handleExitFullscreen();
      setIsFullscreen(false); // Force state change for CSS fallback
    } else {
      handleFullscreen();
      setIsFullscreen(true); // Force state change for CSS fallback
    }
  };

  const handleReport = () => {
    setShowReportToast(true);
    setTimeout(() => setShowReportToast(false), 3000);
  };

  const handleCommentClick = () => {
    if (isFullscreen) {
      alert("Real-time lobby chat & comment drawer is coming in the next update!");
    } else {
      const faqSection = document.getElementById("faq-section");
      if (faqSection) {
        faqSection.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: document.body.scrollHeight - 500, behavior: "smooth" });
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

  // Resolve precise aspect ratio style based on game metadata to prevent black spacing
  const isPortraitMode = isPortraitOverride !== null ? isPortraitOverride : !!game.isPortrait;
  const gameAspect = game.aspectRatio || (game.isPortrait ? "9:16" : "16:9");

  // A game is interacting in fullscreen on mobile, or always interactive on desktop
  const isInteracting = !isMobileDevice || isFullscreen;

  let aspectClass = "aspect-video";
  if (isPortraitMode) {
    if (gameAspect === "3:4") {
      aspectClass = "aspect-[3/4]";
    } else if (gameAspect === "2:3") {
      aspectClass = "aspect-[2/3]";
    } else {
      aspectClass = "aspect-[9/16]";
    }
  }

  return (
    <div className="relative w-full text-white pb-16">
      <style>{`
        @media (max-width: 767px) {
          /*
           * Landscape game on portrait-held mobile:
           * Uses position:fixed + transform-origin:top left + rotate(90deg)
           * The left offset = 100vw pushes the element right so after 90deg rotation
           * the top-left corner lands at viewport top-left. This avoids all cropping.
           */
          .rotate-landscape-mobile {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100dvh !important;
            height: 100dvw !important;
            transform: rotate(90deg) !important;
            transform-origin: top left !important;
            /* After 90deg rotation around top-left, the element moves up by its width.
               translateX(100vw) shifts it right so it maps onto the screen perfectly. */
            transform: translateX(100vw) rotate(90deg) !important;
            z-index: 99999 !important;
            background: #000 !important;
          }

          /*
           * CrazyGames-style safe area bar for PORTRAIT fullscreen:
           * The bar height perfectly adapts to the exit button: exactly 30px high.
           * The Exit button is vertically centered inside this compact space, leaving exactly
           * 3px margin above/below. This allows it to sit perfectly aligned with the camera hole/notch.
           */
          .mobile-safe-area-bar {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            box-sizing: border-box;
            height: 30px;
            padding: 0 10px;
            background: #000000;
            z-index: 9999;
          }

          /*
           * Landscape-specific safe area bar:
           * When the game is rotated 90deg, the physical "top" of the phone becomes the "left" side.
           * So we use left/right safe-area insets for padding.
           * Height is fixed 30px since the notch is now on the side, not above.
           */
          .mobile-safe-area-bar-landscape {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            box-sizing: border-box;
            height: 30px;
            padding-top: 0;
            padding-left: max(env(safe-area-inset-left, 0px), env(safe-area-inset-top, 0px), 12px);
            padding-right: max(env(safe-area-inset-right, 0px), 12px);
            background: #000000;
            z-index: 9999;
          }

          /* Landscape iframe: fill all remaining space after safe area bar */
          .landscape-game-iframe {
            position: absolute !important;
            top: 30px !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            height: calc(100% - 30px) !important;
          }

          /* Exit button — optimized size, premium gradient style matching CrazyGames level */
          .mobile-exit-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            height: 24px;
            padding: 0 10px;
            border-radius: 5px;
            background: #7c3aed;
            color: white;
            font-family: system-ui, -apple-system, sans-serif;
            font-weight: 700;
            font-size: 11px;
            border: none;
            cursor: pointer;
            transition: background 0.15s, transform 0.1s;
            -webkit-tap-highlight-color: transparent;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(124, 58, 237, 0.4);
          }
          .mobile-exit-btn:active {
            transform: scale(0.94);
            background: #6d28d9;
          }

          /* Exit icon */
          .mobile-exit-icon {
            width: 12px;
            height: 12px;
            flex-shrink: 0;
          }
        }
      `}</style>



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

      {/* Floating Report Success Toast */}
      <AnimatePresence>
        {showReportToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-[#ff5e00] border border-white/20 shadow-[0_10px_30px_rgba(255,165,0,0.4)] flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-white" />
            <span className="text-sm font-bold tracking-wider uppercase font-mono text-white">Issues reported to moderators!</span>
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

      {/* Game Player Frame Block - Spans 100% full width at the top */}
      <div ref={containerRef} className="w-full flex flex-col mb-8">
        {/* Dedicated Player Frame wrapper - supports standard and fullscreen theater displays */}
        <div
          ref={playerFrameRef}
          onClick={() => {
            if (isFullscreen && iframeRef.current) {
              iframeRef.current.focus();
            }
          }}
          style={isFullscreen && isMobileDevice ? { height: '100dvh', width: '100dvw', top: 0, left: 0 } : {}}
          className={`w-full overflow-hidden ${isFullscreen
            ? `fixed inset-0 z-[9999] bg-black ${
                isMobileDevice 
                  ? "block" 
                  : `flex flex-col items-center justify-center ${isBarHidden ? "p-0" : "p-0 md:pb-[64px]"}`
              }`
            : "relative flex flex-col bg-[#0b0b12]/80 border-2 border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.8)] rounded-2xl z-20 overflow-hidden"
            }`}
        >
            {/* Ambient Blurred Background backdrop (shown in fullscreen or portrait mode on PC only) */}
            {!isMobileDevice && ((isPortraitOverride !== null ? isPortraitOverride : !!game.isPortrait) || isFullscreen) && (
              <div
                className={`absolute inset-0 bg-cover bg-center ${game.portraitBackground ? 'blur-none opacity-100' : 'blur-[30px] opacity-40'} scale-105 pointer-events-none transition-all duration-700 z-0`}
                style={{ backgroundImage: `url(${game.portraitBackground || game.banner || game.thumbnail})` }}
              >
                {/* Cyberpunk Scanline overlay on bg */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] opacity-15" />
                {/* Vignette wash */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />
              </div>
            )}

            {/* Transient ESC notifications inside Fullscreen container (PC only) */}
            <AnimatePresence>
              {showEscToast && isFullscreen && !isMobileDevice && (
                <motion.div
                  initial={{ opacity: 0, y: -50, x: "-50%" }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="fixed top-6 left-1/2 z-[100] px-5 py-3 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-white/80 text-xs font-bold font-mono tracking-widest shadow-xl flex items-center gap-2"
                >
                  <span>Press</span>
                  <span className="px-2 py-1 rounded bg-white/20 text-white font-black text-[10px] border border-white/10 shadow-inner">ESC</span>
                  <span>to exit full screen</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hover show bar sensor / Chevron handle when bar is hidden in fullscreen */}
            {isFullscreen && isBarHidden && (
              <div
                onMouseEnter={() => setIsBarHidden(false)}
                className="fixed bottom-0 left-0 right-0 h-8 z-[60] hidden md:flex items-center justify-center cursor-pointer group"
              >
                <button
                  onClick={() => setIsBarHidden(false)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-[#07070a] border border-white/10 border-b-0 text-white/40 group-hover:text-white/80 transition-all shadow-[0_-5px_15px_rgba(0,0,0,0.5)] text-[9px] uppercase tracking-widest font-black font-mono"
                >
                  <ChevronUp className="w-3.5 h-3.5 animate-bounce" />
                  Show bar
                </button>
              </div>
            )}

            {/* Dynamic Iframe Viewport Frame */}
            <div
              onClick={() => {
                if (isIframeLoaded) {
                  if (isMobileDevice && !isFullscreen) {
                    toggleFullscreen();
                  } else {
                    iframeRef.current?.focus();
                  }
                }
              }}
              className={`overflow-hidden z-10 ${
                isFullscreen
                  ? isMobileDevice
                    ? isPortraitMode
                      // Portrait game on mobile: fill the full screen vertically (absolute layout, overlay safe-area-bar)
                      ? "absolute inset-0 w-full h-full bg-black"
                      // Landscape game on mobile: rotate 90deg only if the device is physically held in portrait mode
                      : isDevicePortrait
                        ? "rotate-landscape-mobile bg-black" // CSS class handles fixed positioning, rotation, and flex column
                        : "absolute inset-0 w-full h-full bg-black flex flex-col" // Device already landscape, no rotation needed
                    : isPortraitMode
                      ? "absolute inset-0 h-full w-auto aspect-[9/16] mx-auto flex-shrink-0 bg-black flex flex-col"
                      : "absolute inset-0 w-full h-full flex-shrink-0 bg-black flex flex-col"
                  : !hasStarted && isMobileDevice
                    ? "relative w-full flex flex-col bg-transparent" // Mobile pre-start view: natural vertical layout, no aspect lock!
                    : isPortraitMode
                      ? `relative h-[68vh] md:h-[72vh] w-auto max-w-full ${aspectClass} mx-auto flex-shrink-0 bg-transparent flex flex-col`
                      : `relative w-full max-w-5xl aspect-video mx-auto flex-shrink-0 bg-black rounded-xl shadow-2xl border border-white/10 flex flex-col`
              }`}
            >
              {/* Mobile Fullscreen Safe Area Top Bar (Portrait Games) */}
              {isFullscreen && isMobileDevice && isPortraitMode && (
                <div className="absolute top-0 left-0 right-0 h-[30px] bg-black z-50 select-none mobile-safe-area-bar">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    className="mobile-exit-btn"
                  >
                    <LogOut style={{ transform: "scaleX(-1)" }} className="mobile-exit-icon" />
                    <span>Exit</span>
                  </button>
                </div>
              )}

              {/* Mobile Fullscreen Safe Area Top Bar (Landscape Games) */}
              {isFullscreen && isMobileDevice && !isPortraitMode && (
                <div className="absolute top-0 left-0 right-0 h-[30px] bg-black z-50 select-none mobile-safe-area-bar-landscape">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExitFullscreen();
                    }}
                    className="mobile-exit-btn"
                  >
                    <LogOut style={{ transform: "scaleX(-1)" }} className="mobile-exit-icon" />
                    <span>Exit</span>
                  </button>
                </div>
              )}
              {/* Screen static scanner overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px] opacity-10 pointer-events-none z-10" />

              {hasStarted && zipLoading && (
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

              {hasStarted && zipError && (
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

              {/* Iframe Loading Overlay — hide once iframe content is confirmed ready */}
              {hasStarted && !isIframeLoaded && !zipLoading && !zipError && !(game.isZipGame && zipIframeUrl) && (
                <div className="absolute inset-0 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-4 z-20 transition-opacity duration-500">
                  <div className="w-16 h-16 rounded-3xl border-2 border-t-electric-blue border-r-neon-purple border-b-transparent border-l-transparent animate-spin shadow-[0_0_20px_rgba(99,102,241,0.2)]" />
                  <span className="text-xs font-heading font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 animate-pulse">
                    Connecting to Server...
                  </span>
                </div>
              )}

              {hasStarted ? (
                // For ZIP games: show iframe once blobUrl is ready
                // For URL games: show iframe immediately once hasStarted
                (!game.isZipGame || zipIframeUrl) && (
                  <>
                    <iframe
                      ref={iframeRef}
                      {...(game.isZipGame
                        ? { src: zipIframeUrl! }
                        // URL game: use the configured iframe URL
                        : { src: getSecureIframeUrl(game.iframeUrl) }
                      )}
                      onLoad={() => setIsIframeLoaded(true)}
                      className={`border-none ${
                        isFullscreen && isMobileDevice
                          ? isPortraitMode
                            ? "absolute top-[30px] left-0 w-full h-[calc(100%-30px)] z-0"
                            : "landscape-game-iframe"
                          : "w-full h-full relative z-0"
                      } ${
                        !isInteracting ? "pointer-events-none" : "pointer-events-auto"
                      }`}
                      allow="autoplay; fullscreen; keyboard; gamepad; pointer-lock; accelerometer; gyroscope; microphone; camera; display-capture; web-share"
                      allowFullScreen
                      scrolling="yes"
                      title={game.title}
                    />
                  </>
                )
              ) : (
                <div className={`z-30 flex flex-col items-center justify-center overflow-hidden bg-black/85 ${
                  isMobileDevice 
                    ? "relative w-full py-8 px-6 min-h-[420px]" // Premium, natural page content layout on mobile!
                    : "absolute inset-0 rounded-xl" // Centered overlay inside iframe container on PC
                }`}>
                  {/* Sleek blurred backdrop of the game banner or thumbnail */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center blur-[20px] opacity-35 scale-105 pointer-events-none"
                    style={{ backgroundImage: `url(${game.banner || game.thumbnail})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/75 to-black z-10 pointer-events-none" />
                  
                  {/* Central Cyberpunk Interactive Cover Card */}
                  <div className="relative z-20 flex flex-col items-center w-full max-w-md text-center select-none">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className={`relative group ${isMobileDevice ? "mb-5 w-full max-w-[260px] aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.6)] border border-white/15" : "mb-4"}`}
                    >
                      {/* Glowing background halo on PC, direct game banner card on mobile */}
                      {!isMobileDevice && <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-electric-blue to-neon-purple opacity-40 blur-lg group-hover:opacity-75 transition duration-500" />}
                      <img 
                        src={isMobileDevice ? (game.banner || game.thumbnail) : game.thumbnail} 
                        alt={game.title} 
                        className={isMobileDevice ? "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" : "relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-white/20 shadow-2xl animate-pulse-subtle"}
                      />
                    </motion.div>
                    
                    <motion.h2 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                      className="text-2xl sm:text-3xl font-heading font-black text-white uppercase italic tracking-wider leading-tight mb-1 drop-shadow-md"
                    >
                      {game.title}
                    </motion.h2>
                    
                    {!isMobileDevice && (
                      <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-[10px] sm:text-xs text-white/50 font-semibold mb-3 font-mono"
                      >
                        By {game.developer} • {game.plays} Plays
                      </motion.p>
                    )}
                    
                    {/* Device Mode & Rating Notice Badges (CrazyGames Style layout on mobile) */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 }}
                      className="flex flex-wrap items-center justify-center gap-3 mb-6"
                    >
                      <span className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-white/5 text-white/70 border border-white/10 rounded-lg">
                        <Sparkles size={11} className="text-amber-400" />
                        <span>{(ratingPercentage / 10).toFixed(1)}/10</span>
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-white/5 text-white/70 border border-white/10 rounded-lg">
                        <Gamepad size={11} className="text-electric-blue" />
                        <span>{game.genre}</span>
                      </span>
                      {!isMobileDevice && (
                        <span className="flex items-center gap-1 px-2.5 py-1 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest bg-white/5 text-white/70 border border-white/10 rounded-lg">
                          {game.isPortrait ? (
                            <>
                              <Smartphone size={10} className="text-electric-blue" />
                              Portrait Mode
                            </>
                          ) : (
                            <>
                              <Laptop size={10} className="text-neon-purple" />
                              Landscape Mode
                            </>
                          )}
                        </span>
                      )}
                    </motion.div>
                    
                    <motion.button
                      onClick={handleStartPlay}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: [0.98, 1.02, 0.98], opacity: 1 }}
                      transition={{ 
                        opacity: { duration: 0.5 },
                        scale: { repeat: Infinity, duration: 3, ease: "easeInOut" }
                      }}
                      className={`group relative flex items-center justify-center gap-2.5 font-heading font-black uppercase transition-all shadow-[0_8px_25px_rgba(124,58,237,0.45)] cursor-pointer hover:brightness-110 active:scale-95 ${
                        isMobileDevice
                          ? "w-full max-w-[280px] py-4 px-6 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white text-xs tracking-wider"
                          : "px-6 py-3.5 sm:px-8 sm:py-4 bg-gradient-to-r from-electric-blue via-neon-cyan to-neon-purple text-white text-[11px] sm:text-xs tracking-widest rounded-xl"
                      }`}
                    >
                      <Gamepad className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Play now</span>
                    </motion.button>
                  </div>
                </div>
              )}
            </div>



            {/* Mobile Fullscreen Floating Button — always visible on touch devices */}
            {!isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="md:hidden absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-white/80 active:text-electric-blue active:bg-black/90 transition-all shadow-lg"
                title="Fullscreen Mode"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Fullscreen</span>
              </button>
            )}

            {/* Premium Action Control Toolbar */}
            <div
              className={`flex items-center justify-between gap-4 transition-all duration-500 z-30 ${isFullscreen
                ? `absolute bottom-0 left-0 w-full rounded-none bg-[#09090e]/95 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-5px_30px_rgba(0,0,0,0.8)] px-4 py-3 sm:px-6 ${isBarHidden ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"} hidden md:flex`
                : "w-full bg-[#0e0e18] border-t-2 border-white/20 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] px-4 py-2 sm:px-6 relative z-20 hidden md:flex"
                }`}
            >
              {/* Left toolbar details */}
              <div className="flex items-center gap-3 select-none min-w-0">
                <img
                  src={game.thumbnail}
                  alt=""
                  className="w-8 h-8 rounded-md object-cover border border-white/10 shrink-0 shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800";
                  }}
                />
                <div className="flex flex-col min-w-0">
                  <h2 className="text-sm sm:text-base font-heading font-black text-white uppercase italic tracking-wider leading-none flex items-center gap-2 truncate">
                    {game.title}
                    {isFullscreen && (
                      <span className="text-[8px] font-extrabold uppercase tracking-widest bg-white/10 text-white/70 px-1.5 py-0.5 rounded font-mono">
                        LIVE
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-semibold text-white/40 font-mono">{game.developer}</span>
                    <span className="text-[9px] text-white/20">•</span>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[9px] font-bold text-emerald-400 font-mono">{ratingPercentage}% Rating</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Hide Button (Poki Style - only in full screen) */}
              {isFullscreen && (
                <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
                  <button
                    onClick={() => setIsBarHidden(true)}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] hover:border-white/20 hover:scale-105 transition-all text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-sm font-mono animate-fade-in"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide this bar</span>
                  </button>
                </div>
              )}

              {/* Right toolbar actions */}
              <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
                {/* Mobile Fallback Hide Button */}
                {isFullscreen && (
                  <button
                    onClick={() => setIsBarHidden(true)}
                    className="md:hidden flex items-center gap-1.5 p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white transition-all cursor-pointer"
                    title="Hide Toolbar"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                )}
                {/* Like / Dislike Button Groups */}
                <div className="flex items-center rounded-lg bg-white/[0.03] p-0.5 border border-white/[0.06]">
                  <button
                    onClick={() => handleVote("like")}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-all text-xs font-bold cursor-pointer ${game.userVote === "like"
                      ? "bg-emerald-500/20 text-emerald-400 shadow-inner animate-pulse-subtle"
                      : "text-white/40 hover:text-white/80 hover:bg-white/[0.02]"
                      }`}
                    title="Like this game"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="font-mono">{game.likes}</span>
                  </button>
                  <div className="w-[1px] h-3.5 bg-white/10" />
                  <button
                    onClick={() => handleVote("dislike")}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-all text-xs font-bold cursor-pointer ${game.userVote === "dislike"
                      ? "bg-red-500/20 text-red-400 shadow-inner animate-pulse-subtle"
                      : "text-white/40 hover:text-white/80 hover:bg-white/[0.02]"
                      }`}
                    title="Dislike this game"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span className="font-mono">{game.dislikes}</span>
                  </button>
                </div>

                {/* Favorite Heart Toggle */}
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`hidden sm:flex p-2.5 rounded-lg border transition-all cursor-pointer ${isFavorited
                    ? "bg-red-500/20 border-red-500/30 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)] animate-pulse-subtle"
                    : "bg-white/[0.03] border-white/[0.05] text-white/40 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                >
                  <Heart className={`w-3.5 h-3.5 transition-transform ${isFavorited ? "fill-red-400 text-red-400 scale-105" : ""}`} />
                </button>

                {/* Report alert trigger */}
                <button
                  onClick={handleReport}
                  className={`hidden sm:flex p-2.5 rounded-lg border transition-all cursor-pointer ${showReportToast
                    ? "bg-amber-500/20 border-amber-500/30 text-amber-400 animate-pulse"
                    : "bg-white/[0.03] border-white/[0.05] text-white/40 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  title="Report issues/bugs"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                </button>

                {/* FAQ Comment Drawer scroll trigger */}
                <button
                  onClick={handleCommentClick}
                  className="hidden sm:flex p-2.5 rounded-lg bg-white/[0.03] border-white/[0.05] text-white/40 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
                  title="View Comments & FAQs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>

                {/* Share Trigger */}
                <button
                  onClick={handleShare}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white/40 hover:text-white hover:bg-white/[0.06] transition-all text-xs font-bold cursor-pointer font-sans"
                  title="Copy Share Link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline font-sans">Share</span>
                </button>

                {/* Rotation/Device Layout Toggle */}
                <button
                  onClick={() => setIsPortraitOverride(isPortraitOverride === null ? !(isPortraitOverride !== null ? isPortraitOverride : !!game.isPortrait) : !isPortraitOverride)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${(isPortraitOverride !== null ? isPortraitOverride : !!game.isPortrait)
                    ? "bg-neon-purple/20 border-neon-purple/30 text-neon-purple shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                    : "bg-white/[0.03] border-white/[0.05] text-white/40 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  title="Rotate Device Orientation"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>

                {/* Fullscreen Toggle */}
                <button
                  onClick={toggleFullscreen}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${isFullscreen
                    ? "bg-electric-blue/20 border-electric-blue/30 text-electric-blue shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                    : "bg-white/[0.03] border-white/[0.05] text-white/40 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

      {/* Split Content Grid: Left specs and details, Right suggestions & developer widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Specs & Details (9 cols) */}
        <div className="lg:col-span-9 flex flex-col gap-8">

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
            <section id="faq-section" className="p-6 rounded-2xl bg-[#07070a]/60 border border-white/[0.04] backdrop-blur-xl">
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
                          className={`w-4 h-4 text-white/40 transition-transform duration-300 ${isOpen ? "rotate-180 text-electric-blue" : ""
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

        {/* RIGHT COLUMN: Play Next & Developer widget (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-24">
          
          {/* Play Next Suggestions Widget */}
          <div className="flex flex-col bg-[#07070c] border border-white/[0.08] rounded-2xl p-4 shadow-xl z-20">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/[0.06]">
              <Gamepad className="w-4 h-4 text-electric-blue animate-pulse-subtle" />
              <h3 className="text-sm font-heading font-black tracking-wider uppercase text-white/90">
                Play Next
              </h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3.5 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
              {suggestions.map((sug, idx) => (
                <div key={sug.id} onClick={() => onSelectGame(sug.id)} className="h-full flex cursor-pointer">
                  <GameTile game={sug} index={idx} compact={true} />
                </div>
              ))}
            </div>
          </div>

          {/* Developer Info Widget */}
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
    </div>
  );
}
