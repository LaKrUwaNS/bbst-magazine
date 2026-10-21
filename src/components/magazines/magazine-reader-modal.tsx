"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  RotateCcw,
  Maximize,
  BookOpen,
  Layers,
  FileText,
  AlertCircle,
  Loader2,
  Eye,
  Check,
  Volume2,
  VolumeX,
} from "lucide-react";
import { MagazineIssueItem } from "@/types/magazine";
import * as pdfjsLib from "pdfjs-dist";

// Configure local worker to avoid any cross-origin restrictions
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

interface MagazineReaderModalProps {
  magazine: MagazineIssueItem | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FlipLeafState {
  direction: "next" | "prev";
  frontSnapshot: string | null;
  backSnapshot: string | null;
  leafPageNum: number;
  backPageNum: number;
}

export function MagazineReaderModal({
  magazine,
  isOpen,
  onClose,
}: MagazineReaderModalProps) {
  const shouldReduceMotion = useReducedMotion();

  // PDF Document State
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Reader Navigation & Display Mode
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"spread" | "single">(() => {
    if (typeof window !== "undefined" && window.innerWidth < 960) {
      return "single";
    }
    return "spread";
  });
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [isFlipping, setIsFlipping] = useState<"next" | "prev" | null>(null);
  const [flipLeaf, setFlipLeaf] = useState<FlipLeafState | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [resumedFromStorage, setResumedFromStorage] = useState(false);

  // In-memory cache for rendered page snapshots (used for zero-latency 3D page flip faces)
  const pageSnapshotsRef = useRef<Map<number, string>>(new Map());

  // Refs for canvas elements & container
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const singleCanvasRef = useRef<HTMLCanvasElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Pointer drag tracking for realistic touch / mouse page swipe
  const dragStartXRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  // Storage key for reading progress
  const storageKey = useMemo(() => {
    return magazine ? `bbst_read_progress_${magazine.slug || magazine.id}` : "";
  }, [magazine]);

  // Computed URL for the current magazine
  const rawUrl =
    magazine?.pdfAsset || (magazine ? `/assets/magazines/${magazine.slug}.pdf` : "");

  // Reset reader states during render when magazine/URL changes
  const [loadedUrl, setLoadedUrl] = useState(rawUrl);
  if (rawUrl !== loadedUrl) {
    setLoadedUrl(rawUrl);
    setPdfDoc(null);
    setPdfLoading(true);
    setPdfError(null);
    setCurrentPage(1);
    setTotalPages(1);
  }

  // Responsive Layout Detection: auto-switch to single page on narrow screens
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 960) {
        setViewMode("single");
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scrolling when reader is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Load and Parse the Real Magazine PDF
  useEffect(() => {
    if (!isOpen || !magazine || !rawUrl) return;

    let isMounted = true;
    let activeTask: pdfjsLib.PDFDocumentLoadingTask | null = null;
    const snapshots = pageSnapshotsRef.current;

    // Build URL through our resilient CORS-safe PDF proxy
    const proxyUrl = `/api/magazines/pdf-proxy?url=${encodeURIComponent(rawUrl)}`;

    async function loadPdfDocument() {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: proxyUrl,
          cMapUrl: "https://unpkg.com/pdfjs-dist@4.10.38/cmaps/",
          cMapPacked: true,
        });
        activeTask = loadingTask;

        const doc = await loadingTask.promise;
        if (!isMounted) return;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setPdfLoading(false);

        // Restore saved reading progress if present
        if (storageKey) {
          const savedPage = localStorage.getItem(storageKey);
          if (savedPage) {
            const pageNum = parseInt(savedPage, 10);
            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= doc.numPages) {
              setCurrentPage(pageNum);
              setResumedFromStorage(true);
              setTimeout(() => {
                if (isMounted) setResumedFromStorage(false);
              }, 3000);
            }
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        console.warn(
          "[MagazineReader] Proxy fetch error, attempting direct URL fallback:",
          err,
        );

        // Attempt direct URL fallback
        try {
          const directTask = pdfjsLib.getDocument({
            url: rawUrl,
          });
          activeTask = directTask;
          const doc = await directTask.promise;
          if (!isMounted) return;
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setPdfLoading(false);
        } catch (directErr: unknown) {
          if (!isMounted) return;
          const msg =
            directErr instanceof Error
              ? directErr.message
              : "Failed to load magazine PDF.";
          console.error("[MagazineReader] Fatal PDF loading error:", directErr);
          setPdfError(msg);
          setPdfLoading(false);
        }
      }
    }

    loadPdfDocument();

    return () => {
      isMounted = false;
      snapshots.clear();
      if (activeTask) {
        try {
          activeTask.destroy();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [isOpen, magazine, rawUrl, storageKey]);

  // Save Reading Progress
  useEffect(() => {
    if (storageKey && currentPage > 1) {
      try {
        localStorage.setItem(storageKey, currentPage.toString());
      } catch {
        // LocalStorage quota or access exception silently handled
      }
    }
  }, [storageKey, currentPage]);

  // Determine Active Pages for Single vs Two-Page Spread Mode
  // In Spread mode:
  // - Page 1 = Front Cover (single centered book on desk)
  // - Page 2 & 3 = Left & Right spread
  // - Page 4 & 5 = Left & Right spread, etc.
  const isFrontCover = viewMode === "spread" && currentPage === 1;
  const leftPageNum =
    viewMode === "spread"
      ? currentPage % 2 === 0
        ? currentPage
        : currentPage - 1
      : currentPage;
  const rightPageNum = leftPageNum + 1;
  const hasRightPage = rightPageNum <= totalPages;

  // Render Page onto a Canvas Element & Cache Snapshot
  const renderPageToCanvas = useCallback(
    async (
      pageNum: number,
      canvas: HTMLCanvasElement | null,
      targetScale: number,
    ) => {
      if (!canvas || !pdfDoc || pageNum < 1 || pageNum > totalPages) return;

      try {
        const page = await pdfDoc.getPage(pageNum);
        const unscaledViewport = page.getViewport({ scale: 1 });

        // Calculate responsive scale based on modal container dimensions
        const containerWidth = modalContainerRef.current?.clientWidth || 1000;
        const containerHeight = modalContainerRef.current?.clientHeight || 700;

        // Base width calculation depending on spread vs single
        const availableWidth =
          viewMode === "spread" && pageNum > 1
            ? (containerWidth - 140) / 2
            : containerWidth - 160;

        const scaleX = availableWidth / unscaledViewport.width;
        const scaleY = (containerHeight - 160) / unscaledViewport.height;
        const fitScale = Math.min(scaleX, scaleY, 1.6);
        const effectiveScale = fitScale * (targetScale / 100);

        const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for crisp vector fidelity
        const viewport = page.getViewport({ scale: effectiveScale * dpr });

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
        canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Render vector PDF page to canvas
        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        // Cache rendered snapshot for instant 3D page flip leaves
        try {
          const snapshotUrl = canvas.toDataURL("image/webp", 0.9);
          pageSnapshotsRef.current.set(pageNum, snapshotUrl);
        } catch {
          // ignore toDataURL errors (e.g. tainted canvas)
        }
      } catch (err) {
        console.warn(`[MagazineReader] Error rendering page ${pageNum}:`, err);
      }
    },
    [pdfDoc, totalPages, viewMode],
  );

  // Helper to fetch or generate a real snapshot of any page on demand
  const getPageSnapshot = useCallback(
    async (pageNum: number): Promise<string | null> => {
      if (!pdfDoc || pageNum < 1 || pageNum > totalPages) return null;
      if (pageSnapshotsRef.current.has(pageNum)) {
        return pageSnapshotsRef.current.get(pageNum)!;
      }
      try {
        const page = await pdfDoc.getPage(pageNum);
        const unscaled = page.getViewport({ scale: 1 });
        const scale = Math.min(1.5, 900 / unscaled.width);
        const vp = page.getViewport({ scale });

        const offscreen = document.createElement("canvas");
        offscreen.width = Math.floor(vp.width);
        offscreen.height = Math.floor(vp.height);
        const ctx = offscreen.getContext("2d", { alpha: false });
        if (!ctx) return null;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        await page.render({ canvasContext: ctx, viewport: vp }).promise;

        const dataUrl = offscreen.toDataURL("image/webp", 0.9);
        pageSnapshotsRef.current.set(pageNum, dataUrl);
        return dataUrl;
      } catch (e) {
        console.warn("[MagazineReader] Error generating snapshot for page:", pageNum, e);
        return null;
      }
    },
    [pdfDoc, totalPages],
  );

  // Pre-cache adjacent pages for seamless zero-lag 3D page turning
  useEffect(() => {
    if (!pdfDoc || pdfLoading) return;
    const pagesToCache = [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
      currentPage + 3,
    ].filter((p) => p >= 1 && p <= totalPages);

    pagesToCache.forEach((p) => {
      if (!pageSnapshotsRef.current.has(p)) {
        getPageSnapshot(p);
      }
    });
  }, [pdfDoc, pdfLoading, currentPage, totalPages, getPageSnapshot]);

  // Trigger Rendering whenever page, zoom, or view mode changes
  useEffect(() => {
    if (pdfLoading || !pdfDoc) return;

    if (viewMode === "single" || isFrontCover) {
      renderPageToCanvas(currentPage, singleCanvasRef.current, zoomLevel);
    } else {
      renderPageToCanvas(leftPageNum, leftCanvasRef.current, zoomLevel);
      if (hasRightPage) {
        renderPageToCanvas(rightPageNum, rightCanvasRef.current, zoomLevel);
      }
    }
  }, [
    pdfLoading,
    pdfDoc,
    currentPage,
    viewMode,
    zoomLevel,
    isFrontCover,
    leftPageNum,
    rightPageNum,
    hasRightPage,
    renderPageToCanvas,
  ]);

  // Synthesize realistic subtle paper rustle sound using Web Audio API
  const playPaperSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const duration = 0.16;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const progress = i / bufferSize;
        const envelope =
          Math.sin(progress * Math.PI) * Math.exp(-progress * 2.2);
        data[i] = (Math.random() * 2 - 1) * envelope * 0.16;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1500, ctx.currentTime);
      filter.Q.setValueAtTime(1.3, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.onended = () => {
        ctx.close().catch(() => {});
      };
    } catch {
      // AudioContext unavailable or blocked - safe ignore
    }
  }, [soundEnabled]);

  // Page Turn Handlers with Real PDF Front & Back Faces for 3D Flip
  const handleNextPage = useCallback(async () => {
    if (isFlipping || pdfLoading || currentPage >= totalPages) return;

    playPaperSound();

    if (shouldReduceMotion) {
      if (viewMode === "spread") {
        if (currentPage === 1) {
          setCurrentPage(2);
        } else if (currentPage + 2 <= totalPages) {
          setCurrentPage((prev) => prev + 2);
        } else if (currentPage + 1 <= totalPages) {
          setCurrentPage((prev) => prev + 1);
        }
      } else {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
      }
      return;
    }

    // Determine the exact pages for the turning leaf:
    // In spread:
    // - On cover (Page 1): Leaf front is Page 1, Leaf back is Page 2.
    // - On spread (e.g. 2 & 3): Leaf front is Page 3, Leaf back is Page 4.
    // In single: Leaf front is currentPage, Leaf back is currentPage + 1.
    const frontNum =
      viewMode === "spread"
        ? currentPage === 1
          ? 1
          : rightPageNum
        : currentPage;
    const backNum = frontNum + 1;

    // Retrieve or capture real PDF snapshots for both sides of the turning paper leaf
    let frontSnapshot: string | null = pageSnapshotsRef.current.get(frontNum) || null;
    let backSnapshot: string | null = pageSnapshotsRef.current.get(backNum) || null;

    if (!frontSnapshot) {
      frontSnapshot = await getPageSnapshot(frontNum);
    }
    if (!backSnapshot && backNum <= totalPages) {
      backSnapshot = await getPageSnapshot(backNum);
    }

    setIsFlipping("next");
    setFlipLeaf({
      direction: "next",
      frontSnapshot,
      backSnapshot,
      leafPageNum: frontNum,
      backPageNum: backNum,
    });

    if (viewMode === "spread") {
      if (currentPage === 1) {
        setCurrentPage(2);
      } else if (currentPage + 2 <= totalPages) {
        setCurrentPage((prev) => prev + 2);
      } else if (currentPage + 1 <= totalPages) {
        setCurrentPage((prev) => prev + 1);
      }
    } else {
      setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    }

    setTimeout(() => {
      setIsFlipping(null);
      setFlipLeaf(null);
    }, 520);
  }, [
    isFlipping,
    pdfLoading,
    currentPage,
    totalPages,
    viewMode,
    rightPageNum,
    playPaperSound,
    shouldReduceMotion,
    getPageSnapshot,
  ]);

  const handlePrevPage = useCallback(async () => {
    if (isFlipping || pdfLoading || currentPage <= 1) return;

    playPaperSound();

    if (shouldReduceMotion) {
      if (viewMode === "spread") {
        if (currentPage === 2 || currentPage === 3) {
          setCurrentPage(1);
        } else if (currentPage > 3) {
          setCurrentPage((prev) => Math.max(1, prev - 2));
        }
      } else {
        setCurrentPage((prev) => Math.max(1, prev - 1));
      }
      return;
    }

    // Determine the exact pages for the turning leaf:
    // In spread:
    // - On spread 2 & 3: turning back to cover -> Leaf front is Page 2, Leaf back is Page 1 (Cover).
    // - On spread 4 & 5: Leaf front is Page 4, Leaf back is Page 3.
    // In single: Leaf front is currentPage, Leaf back is currentPage - 1.
    const frontNum = viewMode === "spread" ? leftPageNum : currentPage;
    const backNum = frontNum - 1;

    let frontSnapshot: string | null = pageSnapshotsRef.current.get(frontNum) || null;
    let backSnapshot: string | null = pageSnapshotsRef.current.get(backNum) || null;

    if (!frontSnapshot) {
      frontSnapshot = await getPageSnapshot(frontNum);
    }
    if (!backSnapshot && backNum >= 1) {
      backSnapshot = await getPageSnapshot(backNum);
    }

    setIsFlipping("prev");
    setFlipLeaf({
      direction: "prev",
      frontSnapshot,
      backSnapshot,
      leafPageNum: frontNum,
      backPageNum: backNum,
    });

    if (viewMode === "spread") {
      if (currentPage === 2 || currentPage === 3) {
        setCurrentPage(1);
      } else if (currentPage > 3) {
        setCurrentPage((prev) => Math.max(1, prev - 2));
      }
    } else {
      setCurrentPage((prev) => Math.max(1, prev - 1));
    }

    setTimeout(() => {
      setIsFlipping(null);
      setFlipLeaf(null);
    }, 520);
  }, [
    isFlipping,
    pdfLoading,
    currentPage,
    viewMode,
    leftPageNum,
    playPaperSound,
    shouldReduceMotion,
    getPageSnapshot,
  ]);

  // Pointer drag gestures for realistic touch & mouse swipe
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartXRef.current = e.clientX;
    isDraggingRef.current = true;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || dragStartXRef.current === null) return;
    const deltaX = e.clientX - dragStartXRef.current;
    dragStartXRef.current = null;
    isDraggingRef.current = false;

    // Threshold of 45px drag triggers natural page flip
    if (deltaX < -45) {
      handleNextPage();
    } else if (deltaX > 45) {
      handlePrevPage();
    }
  };

  // Zoom Controls: Zoom In, Zoom Out, Fit to Page (100%), Fit to Width (125%)
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(180, prev + 15));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(70, prev - 15));
  const handleFitPage = () => setZoomLevel(100);
  const handleFitWidth = () => setZoomLevel(125);

  // Fullscreen Toggle
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (modalContainerRef.current?.requestFullscreen) {
          await modalContainerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.warn("Fullscreen toggle error:", err);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Keyboard navigation: Left/Right Arrow, Space, Escape, Home, End
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showThumbnails) {
          setShowThumbnails(false);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrevPage();
      } else if (
        e.key === "ArrowRight" ||
        e.key === "PageDown" ||
        e.key === " "
      ) {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === "Home") {
        e.preventDefault();
        setCurrentPage(1);
      } else if (e.key === "End") {
        e.preventDefault();
        setCurrentPage(totalPages);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    showThumbnails,
    handlePrevPage,
    handleNextPage,
    totalPages,
    onClose,
  ]);

  if (!isOpen || !magazine) return null;

  // Calculate dynamic physical paper stack thickness based on reading progress
  const progressRatio =
    totalPages > 1 ? (currentPage - 1) / (totalPages - 1) : 0;
  const leftStackWidth = Math.max(2, Math.round(progressRatio * 12));
  const rightStackWidth = Math.max(2, Math.round((1 - progressRatio) * 12));

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Magazine Reader: ${magazine.title}`}
        className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-2 md:p-4 bg-black/85 backdrop-blur-md select-none"
      >
        {/* Main Reader Stage Window */}
        <motion.div
          ref={modalContainerRef}
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.98, y: 10 }
          }
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full h-full max-w-7xl max-h-[98vh] bg-[#141414] rounded-none sm:rounded-2xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden text-white"
        >
          {/* Top Control Toolbar */}
          <header className="shrink-0 flex items-center justify-between px-3 sm:px-6 py-2.5 bg-[#1C1C1C] border-b border-gray-800 gap-3 z-30">
            {/* Left: Magazine Edition Branding (calm, static editorial green badge without pulse) */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full bg-[#00FF00] shrink-0"
                title="BBST Official Publication"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                    {magazine.title}
                  </h2>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#00FF00]/15 text-[#00E500] border border-[#00FF00]/30 uppercase">
                    {magazine.edition || "Official Edition"}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 hidden sm:block truncate">
                  Faculty of Technological Studies &bull; Uva Wellassa
                  University
                </p>
              </div>
            </div>

            {/* Right: Controls & Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Resumed Progress Toast Indicator */}
              {resumedFromStorage && (
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-[#00FF00] text-[11px] font-semibold border border-emerald-500/30">
                  <Check className="w-3 h-3" />
                  <span>Resumed at page {currentPage}</span>
                </div>
              )}

              {/* Thumbnails Drawer Toggle Button */}
              <button
                type="button"
                onClick={() => setShowThumbnails(!showThumbnails)}
                title="Page Index & Thumbnails"
                aria-label="Toggle page thumbnails drawer"
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  showThumbnails
                    ? "bg-[#00FF00] text-black font-bold"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Pages</span>
              </button>

              {/* View Mode Switcher: Two-Page Spread vs Single */}
              <div className="hidden lg:flex items-center bg-gray-800 rounded-lg p-0.5 border border-gray-700 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("spread")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    viewMode === "spread"
                      ? "bg-[#171717] text-white shadow-xs"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Two-Page Magazine Spread"
                >
                  Book Spread
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("single")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    viewMode === "single"
                      ? "bg-[#171717] text-white shadow-xs"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Single Page"
                >
                  Single
                </button>
              </div>

              {/* Zoom Controls: Out, Display, In, Fit Page, Fit Width */}
              <div className="hidden sm:flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-lg border border-gray-700">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 70}
                  aria-label="Zoom out"
                  title="Zoom out"
                  className="p-1 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-gray-200 w-10 text-center">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 180}
                  aria-label="Zoom in"
                  title="Zoom in"
                  className="p-1 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                {zoomLevel !== 100 && (
                  <button
                    type="button"
                    onClick={handleFitPage}
                    title="Fit to Page (100%)"
                    aria-label="Reset zoom to 100%"
                    className="p-1 text-gray-400 hover:text-white ml-0.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
                {zoomLevel !== 125 && (
                  <button
                    type="button"
                    onClick={handleFitWidth}
                    title="Fit to Width (125%)"
                    aria-label="Fit to Width (125%)"
                    className="p-1 text-gray-400 hover:text-white ml-0.5 cursor-pointer"
                  >
                    <Maximize className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={
                  isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"
                }
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                className="hidden sm:inline-flex p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              {/* Page Turn Sound Effect Toggle */}
              <button
                type="button"
                onClick={() => setSoundEnabled((prev) => !prev)}
                aria-label={
                  soundEnabled
                    ? "Mute realistic page-turn sound"
                    : "Enable realistic page-turn sound"
                }
                title={
                  soundEnabled
                    ? "Mute page sound"
                    : "Enable page-turn sound effect"
                }
                className="hidden sm:inline-flex p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#00FF00]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Direct PDF Download */}
              <a
                href={magazine.pdfAsset}
                download={`${magazine.slug}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                title="Download Original PDF"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#171717] hover:bg-black text-white border border-gray-700 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#00FF00]" />
                <span className="hidden sm:inline">PDF</span>
              </a>

              {/* Exit Reader */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Exit Reader"
                title="Close Reader (Esc)"
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-950/80 hover:text-red-400 text-gray-300 transition-colors cursor-pointer ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Reading Surface & Authentic Book Stage */}
          <div
            className="relative flex-1 flex overflow-hidden bg-[#0A0A0A] touch-none"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            {/* Thumbnails Drawer */}
            <AnimatePresence>
              {showThumbnails && (
                <motion.div
                  initial={{ x: -280, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -280, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-y-0 left-0 z-40 w-64 bg-[#181818] border-r border-gray-800 flex flex-col shadow-2xl"
                >
                  <div className="p-3.5 border-b border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Page Index ({totalPages})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowThumbnails(false)}
                      className="p-1 text-gray-400 hover:text-white rounded-md cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {Array.from(
                      { length: totalPages },
                      (_, idx) => idx + 1,
                    ).map((pNum) => {
                      const isActive =
                        viewMode === "spread" && pNum > 1
                          ? pNum === leftPageNum || pNum === rightPageNum
                          : pNum === currentPage;

                      return (
                        <button
                          key={pNum}
                          type="button"
                          onClick={() => {
                            setCurrentPage(pNum);
                            setShowThumbnails(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between ${
                            isActive
                              ? "bg-[#00FF00]/15 border border-[#00FF00]/40 text-white font-bold"
                              : "text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent"
                          }`}
                        >
                          <span className="font-mono">Page {pNum}</span>
                          {pNum === 1 && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded font-semibold">
                              Cover
                            </span>
                          )}
                          {pNum === totalPages && totalPages > 1 && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded font-semibold">
                              Back Cover
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Left Page Turn Click Zone & Chevron */}
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage <= 1 || pdfLoading}
              aria-label="Previous Page"
              title="Previous Page (Left Arrow)"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 shadow-xl disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Main Stage Display Area */}
            <div className="flex-1 flex items-center justify-center p-2 sm:p-6 lg:p-8 overflow-auto select-none">
              {pdfLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  {/* Calm, professional loading indicator without cartoonish bounce */}
                  <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center shadow-lg border border-gray-700">
                    <BookOpen className="w-6 h-6 text-[#00FF00]" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">
                      Opening Digital Magazine
                    </p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin text-[#00E500]" />
                      <span>Parsing authentic vector pages...</span>
                    </p>
                  </div>
                </div>
              ) : pdfError ? (
                <div className="max-w-md p-6 rounded-2xl bg-gray-900 border border-gray-800 text-center space-y-4">
                  <div className="w-12 h-12 bg-red-950/60 border border-red-800 text-red-400 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Unable to Render PDF
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{pdfError}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                    <a
                      href={magazine.pdfAsset}
                      download
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>
                    <a
                      href={magazine.pdfAsset}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Open in Browser</span>
                    </a>
                  </div>
                </div>
              ) : (
                /* Authentic 3D Book Stage (calm transform without conflicting transform animation) */
                <div
                  className={`relative flex items-center justify-center select-none ${
                    isFlipping ? "pointer-events-none" : ""
                  }`}
                  style={{
                    perspective: "2400px",
                    transformStyle: "preserve-3d",
                    transform: `scale(${zoomLevel / 100})`,
                  }}
                >
                  {viewMode === "spread" && !isFrontCover ? (
                    /* TWO-PAGE SPREAD: Authentic open book layout with spine */
                    <div
                      className="relative flex items-center p-2 sm:p-2.5 bg-[#1C1816] rounded-2xl shadow-[0_35px_80px_-15px_rgba(0,0,0,0.9),0_15px_30px_rgba(0,0,0,0.6)] border border-[#2F2925]"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Dynamic Left Page Stack (Pages already read) */}
                      <div
                        className="absolute -left-2.5 inset-y-3 rounded-l-xs pointer-events-none transition-all duration-300"
                        style={{
                          width: `${Math.max(2, leftStackWidth)}px`,
                          background:
                            "repeating-linear-gradient(to bottom, #D5CFBF 0px, #D5CFBF 1px, #FAF8F5 1px, #FAF8F5 3px)",
                          boxShadow:
                            "inset -1px 0 2px rgba(0,0,0,0.25), -2px 0 5px rgba(0,0,0,0.4)",
                        }}
                      />

                      {/* Dynamic Right Page Stack (Pages remaining to read) */}
                      <div
                        className="absolute -right-2.5 inset-y-3 rounded-r-xs pointer-events-none transition-all duration-300"
                        style={{
                          width: `${Math.max(2, rightStackWidth)}px`,
                          background:
                            "repeating-linear-gradient(to bottom, #D5CFBF 0px, #D5CFBF 1px, #FAF8F5 1px, #FAF8F5 3px)",
                          boxShadow:
                            "inset 1px 0 2px rgba(0,0,0,0.25), 2px 0 5px rgba(0,0,0,0.4)",
                        }}
                      />

                      {/* Two-Page Spread Paper Container */}
                      <div
                        className="relative flex items-center bg-[#FDFBF7] rounded-lg overflow-hidden shadow-2xl border border-gray-300/60"
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {/* Left Page (Even Page) */}
                        <div
                          onClick={handlePrevPage}
                          className="relative bg-[#FDFBF7] border-r border-gray-300/80 cursor-pointer group/left"
                          title="Click left page or corner to turn back"
                        >
                          <canvas ref={leftCanvasRef} className="block" />

                          {/* Realistic Concave Spine Gutter Shadow on Left Page */}
                          <div className="absolute inset-y-0 right-0 w-10 bg-linear-to-l from-black/30 via-black/10 to-transparent pointer-events-none" />

                          {/* Left Page Ambient Edge Highlight */}
                          <div className="absolute inset-y-0 left-0 w-3 bg-linear-to-r from-white/40 to-transparent pointer-events-none" />

                          {/* Page Number Watermark */}
                          <span className="absolute bottom-2.5 left-4 text-[10px] text-gray-400 font-mono select-none">
                            {leftPageNum}
                          </span>

                          {/* Interactive Bottom-Left Dog-Ear Curl */}
                          {currentPage > 2 && (
                            <div
                              className="absolute bottom-0 left-0 w-12 h-12 overflow-hidden cursor-pointer group/corner z-20"
                              title="Turn back"
                            >
                              <div className="absolute bottom-0 left-0 w-8 h-8 bg-linear-to-tr from-gray-200/90 to-white shadow-md border-t border-r border-gray-300/60 rounded-tr-sm transition-transform duration-200 group-hover/corner:scale-125 group-hover/corner:translate-x-1 group-hover/corner:-translate-y-1" />
                              <div className="absolute bottom-1 left-1.5 text-[8px] font-bold text-gray-400 group-hover/corner:text-black transition-colors select-none font-mono">
                                &larr;
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Page (Odd Page) */}
                        <div
                          onClick={handleNextPage}
                          className="relative bg-[#FDFBF7] cursor-pointer group/right"
                          title="Click right page or corner to turn forward"
                        >
                          {hasRightPage ? (
                            <>
                              <canvas ref={rightCanvasRef} className="block" />

                              {/* Realistic Concave Spine Gutter Shadow on Right Page */}
                              <div className="absolute inset-y-0 left-0 w-10 bg-linear-to-r from-black/30 via-black/10 to-transparent pointer-events-none" />

                              {/* Right Page Ambient Edge Highlight */}
                              <div className="absolute inset-y-0 right-0 w-3 bg-linear-to-l from-white/40 to-transparent pointer-events-none" />

                              {/* Page Number Watermark */}
                              <span className="absolute bottom-2.5 right-4 text-[10px] text-gray-400 font-mono select-none">
                                {rightPageNum}
                              </span>

                              {/* Interactive Bottom-Right Dog-Ear Curl */}
                              {rightPageNum < totalPages && (
                                <div
                                  className="absolute bottom-0 right-0 w-12 h-12 overflow-hidden cursor-pointer group/corner z-20"
                                  title="Turn forward"
                                >
                                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-linear-to-tl from-gray-200/90 to-white shadow-md border-t border-l border-gray-300/60 rounded-tl-sm transition-transform duration-200 group-hover/corner:scale-125 group-hover/corner:-translate-x-1 group-hover/corner:-translate-y-1" />
                                  <div className="absolute bottom-1 right-1.5 text-[8px] font-bold text-gray-400 group-hover/corner:text-black transition-colors select-none font-mono">
                                    &rarr;
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-75 sm:w-105 aspect-3/4 bg-[#FAF8F5] flex flex-col items-center justify-center text-xs text-gray-400 gap-2 border-l border-gray-200">
                              <BookOpen className="w-6 h-6 text-gray-300" />
                              <span>End of Publication</span>
                            </div>
                          )}
                        </div>

                        {/* Center Spine Crease Accent Lines & Headband */}
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-black/40 pointer-events-none z-10" />
                        <div className="absolute inset-y-0 left-1/2 translate-x-px w-px bg-white/30 pointer-events-none z-10" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#00FF00]/50 rounded-xs pointer-events-none z-20 shadow-xs" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#00FF00]/50 rounded-xs pointer-events-none z-20 shadow-xs" />

                        {/* 3D Page Flip Animation Leaf: Turning Forward */}
                        {flipLeaf?.direction === "next" && (
                          <motion.div
                            key="flip-leaf-next"
                            initial={{ rotateY: 0 }}
                            animate={{ rotateY: -180 }}
                            transition={{
                              duration: 0.5,
                              ease: [0.25, 1, 0.5, 1],
                            }}
                            style={{
                              position: "absolute",
                              top: 0,
                              right: 0,
                              width: "50%",
                              height: "100%",
                              transformOrigin: "left center",
                              transformStyle: "preserve-3d",
                              zIndex: 35,
                            }}
                            className="pointer-events-none"
                          >
                            {/* Front of Turning Leaf (Real PDF Page lifting up from right side) */}
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                              }}
                              className="bg-[#FDFBF7] shadow-2xl overflow-hidden"
                            >
                              {flipLeaf.frontSnapshot ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={flipLeaf.frontSnapshot}
                                  alt={`Flipping page ${flipLeaf.leafPageNum}`}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full bg-[#FDFBF7]" />
                              )}
                              {/* Dynamic curl lighting shadow */}
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 0.45, 0.1] }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 bg-linear-to-l from-black/35 via-black/10 to-transparent"
                              />
                            </div>

                            {/* Back of Turning Leaf (Real PDF Page settling onto left side) */}
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                transform: "rotateY(180deg)",
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                              }}
                              className="bg-[#FDFBF7] border-r border-gray-300 shadow-2xl overflow-hidden"
                            >
                              {flipLeaf.backSnapshot ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={flipLeaf.backSnapshot}
                                  alt={`Flipping page ${flipLeaf.backPageNum}`}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full bg-[#FDFBF7]" />
                              )}
                              {/* Settle shadow on landing */}
                              <motion.div
                                initial={{ opacity: 0.4 }}
                                animate={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 bg-linear-to-r from-black/25 via-black/10 to-transparent"
                              />
                            </div>
                          </motion.div>
                        )}

                        {/* 3D Page Flip Animation Leaf: Turning Backward */}
                        {flipLeaf?.direction === "prev" && (
                          <motion.div
                            key="flip-leaf-prev"
                            initial={{ rotateY: 0 }}
                            animate={{ rotateY: 180 }}
                            transition={{
                              duration: 0.5,
                              ease: [0.25, 1, 0.5, 1],
                            }}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "50%",
                              height: "100%",
                              transformOrigin: "right center",
                              transformStyle: "preserve-3d",
                              zIndex: 35,
                            }}
                            className="pointer-events-none"
                          >
                            {/* Front of Turning Leaf (Real PDF page lifting up from left side) */}
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                              }}
                              className="bg-[#FDFBF7] shadow-2xl overflow-hidden"
                            >
                              {flipLeaf.frontSnapshot ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={flipLeaf.frontSnapshot}
                                  alt={`Flipping page ${flipLeaf.leafPageNum}`}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full bg-[#FDFBF7]" />
                              )}
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 0.45, 0.1] }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 bg-linear-to-r from-black/35 via-black/10 to-transparent"
                              />
                            </div>

                            {/* Back of Turning Leaf (Real PDF page settling onto right side) */}
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                transform: "rotateY(180deg)",
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                              }}
                              className="bg-[#FDFBF7] border-l border-gray-300 shadow-2xl overflow-hidden"
                            >
                              {flipLeaf.backSnapshot ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={flipLeaf.backSnapshot}
                                  alt={`Flipping page ${flipLeaf.backPageNum}`}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full bg-[#FDFBF7]" />
                              )}
                              <motion.div
                                initial={{ opacity: 0.4 }}
                                animate={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 bg-linear-to-l from-black/25 via-black/10 to-transparent"
                              />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  ) : isFrontCover ? (
                    /* FRONT COVER: Bound Closed Magazine on Editorial Desk */
                    <div
                      onClick={handleNextPage}
                      className="relative flex items-center p-2.5 bg-[#1C1816] rounded-2xl shadow-[0_35px_80px_-15px_rgba(0,0,0,0.9),0_15px_30px_rgba(0,0,0,0.6)] border border-[#2F2925] cursor-pointer group"
                      style={{ transformStyle: "preserve-3d" }}
                      title="Click cover to open magazine"
                    >
                      {/* Left Bound Leather Spine */}
                      <div className="w-4 sm:w-5 self-stretch bg-linear-to-r from-[#171717] via-[#2A2A2A] to-[#171717] rounded-l-md border-y border-l border-gray-700 shadow-md flex items-center justify-center">
                        <div className="w-0.5 h-16 bg-[#00FF00]/40 rounded-full" />
                      </div>

                      {/* Cover Page */}
                      <div className="relative bg-[#FDFBF7] shadow-2xl rounded-r-lg overflow-hidden border border-gray-300/60">
                        <canvas ref={singleCanvasRef} className="block" />

                        {/* Realistic Left Spine Fold Shadow */}
                        <div className="absolute inset-y-0 left-0 w-8 bg-linear-to-r from-black/30 via-black/10 to-transparent pointer-events-none" />

                        {/* Glossy Cover Sheen Reflection Sweep */}
                        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

                        {/* Interactive "Open Magazine" Pill Badge */}
                        <div className="absolute bottom-5 right-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#171717]/90 hover:bg-[#171717] text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-xl group-hover:border-[#00FF00] transition-colors">
                          <span>Open Publication</span>
                          <ChevronRight className="w-4 h-4 text-[#00FF00]" />
                        </div>

                        {/* Interactive Bottom-Right Corner Dog-Ear */}
                        <div className="absolute bottom-0 right-0 w-12 h-12 overflow-hidden pointer-events-none group-hover:opacity-100 opacity-60 transition-opacity">
                          <div className="absolute bottom-0 right-0 w-8 h-8 bg-linear-to-tl from-gray-300 to-white shadow-lg border-t border-l border-gray-400 rounded-tl-sm transition-transform duration-200 group-hover:scale-125 group-hover:-translate-x-1 group-hover:-translate-y-1" />
                        </div>
                      </div>

                      {/* Right Edge stacked paper pages (full unread publication block) */}
                      <div
                        className="absolute -right-2.5 inset-y-3 w-2.5 rounded-r-xs pointer-events-none"
                        style={{
                          background:
                            "repeating-linear-gradient(to bottom, #D5CFBF 0px, #D5CFBF 1px, #FAF8F5 1px, #FAF8F5 3px)",
                          boxShadow:
                            "inset 1px 0 2px rgba(0,0,0,0.25), 2px 0 5px rgba(0,0,0,0.4)",
                        }}
                      />
                    </div>
                  ) : (
                    /* SINGLE PAGE VIEW (Mobile / Narrow Screens) */
                    <div
                      onClick={handleNextPage}
                      className="relative flex items-center p-2 bg-[#1C1816] rounded-2xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85)] border border-[#2F2925] cursor-pointer group"
                      style={{ transformStyle: "preserve-3d" }}
                      title="Click page to proceed"
                    >
                      {/* Page Container */}
                      <div className="relative bg-[#FDFBF7] shadow-2xl rounded-lg overflow-hidden border border-gray-300/60">
                        <canvas ref={singleCanvasRef} className="block" />

                        {/* Left Margin Shadow */}
                        <div className="absolute inset-y-0 left-0 w-6 bg-linear-to-r from-black/25 via-black/10 to-transparent pointer-events-none" />

                        {/* Page Number Footer */}
                        <span className="absolute bottom-2.5 right-4 text-[10px] text-gray-400 font-mono select-none">
                          {currentPage} of {totalPages}
                        </span>

                        {/* Bottom Right Corner Curl */}
                        {currentPage < totalPages && (
                          <div className="absolute bottom-0 right-0 w-10 h-10 overflow-hidden pointer-events-none">
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-linear-to-tl from-gray-200 to-white shadow-md border-t border-l border-gray-300/80 rounded-tl-sm" />
                          </div>
                        )}

                        {/* 3D Page Turn Animation for Single Page View (Real PDF front & back) */}
                        {flipLeaf && (
                          <motion.div
                            key={`single-flip-${currentPage}`}
                            initial={{ rotateY: 0, opacity: 1 }}
                            animate={{
                              rotateY:
                                flipLeaf.direction === "next" ? -80 : 80,
                              opacity: 0,
                            }}
                            transition={{
                              duration: 0.45,
                              ease: [0.25, 1, 0.5, 1],
                            }}
                            style={{
                              position: "absolute",
                              inset: 0,
                              transformOrigin:
                                flipLeaf.direction === "next"
                                  ? "left center"
                                  : "right center",
                              transformStyle: "preserve-3d",
                              zIndex: 35,
                            }}
                            className="pointer-events-none bg-[#FDFBF7] shadow-2xl overflow-hidden"
                          >
                            {flipLeaf.frontSnapshot && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={flipLeaf.frontSnapshot}
                                alt="Flipping page"
                                className="w-full h-full object-contain"
                              />
                            )}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.45 }}
                              transition={{ duration: 0.45 }}
                              className="absolute inset-0 bg-linear-to-r from-black/20 via-black/10 to-black/30"
                            />
                          </motion.div>
                        )}
                      </div>

                      {/* Right Page Stack */}
                      <div
                        className="absolute -right-2 inset-y-3 w-2 rounded-r-xs pointer-events-none"
                        style={{
                          background:
                            "repeating-linear-gradient(to bottom, #D5CFBF 0px, #D5CFBF 1px, #FAF8F5 1px, #FAF8F5 3px)",
                          boxShadow: "inset 1px 0 2px rgba(0,0,0,0.25)",
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Page Turn Click Zone & Chevron */}
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || pdfLoading}
              aria-label="Next Page"
              title="Next Page (Right Arrow)"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 shadow-xl disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Bottom Scrubber & Page Navigation Bar */}
          <footer className="shrink-0 px-4 sm:px-6 py-2.5 bg-[#1C1C1C] border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs z-30">
            {/* Page Count Display & Direct Step Controls */}
            <div className="flex items-center gap-3 text-gray-300 font-mono">
              <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {viewMode === "spread" && !isFrontCover ? (
                  <>
                    Pages{" "}
                    <strong className="text-white">
                      {leftPageNum}&ndash;
                      {hasRightPage ? rightPageNum : totalPages}
                    </strong>{" "}
                    of {totalPages}
                  </>
                ) : isFrontCover ? (
                  <>
                    Cover &bull; Page <strong className="text-white">1</strong>{" "}
                    of {totalPages}
                  </>
                ) : (
                  <>
                    Page <strong className="text-white">{currentPage}</strong>{" "}
                    of {totalPages}
                  </>
                )}
              </span>

              {/* Prev / Next Quick Text Buttons in Footer */}
              <div className="flex items-center gap-1 ml-2">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1 || pdfLoading}
                  className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300 hover:text-white transition-colors cursor-pointer text-[11px]"
                  title="Previous Page"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages || pdfLoading}
                  className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300 hover:text-white transition-colors cursor-pointer text-[11px]"
                  title="Next Page"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Interactive Slider Scrubber */}
            <div className="flex items-center gap-3 w-full sm:w-96 max-w-md">
              <span className="text-[10px] text-gray-500 font-mono">1</span>
              <input
                type="range"
                min={1}
                max={totalPages}
                value={currentPage}
                disabled={pdfLoading}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setCurrentPage(val);
                }}
                aria-label="Magazine page scrubber"
                className="w-full accent-[#00FF00] h-1.5 bg-gray-700 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-gray-500 font-mono">
                {totalPages}
              </span>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="hidden xl:flex items-center gap-1.5 text-[10px] text-gray-500">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">
                &larr;
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">
                &rarr;
              </kbd>
              <span>to turn pages</span>
              <span className="mx-1">&bull;</span>
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">
                Esc
              </kbd>
              <span>to exit</span>
            </div>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
