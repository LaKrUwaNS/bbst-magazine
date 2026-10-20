"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
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
  List,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { MagazineIssueItem } from "@/types/magazine";

interface MagazineReaderModalProps {
  magazine: MagazineIssueItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MagazineReaderModal({
  magazine,
  isOpen,
  onClose,
}: MagazineReaderModalProps) {
  const shouldReduceMotion = useReducedMotion();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const totalPages =
    magazine?.pages && magazine.pages.length > 0
      ? magazine.pages.length
      : magazine?.pageCount || 1;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Page Navigation Handlers
  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  // Zoom Controls
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(160, prev + 20));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(80, prev - 20));
  const handleResetZoom = () => setZoomLevel(100);

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
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Keyboard navigation: Escape, ArrowLeft, ArrowRight
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showToc) {
          setShowToc(false);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowLeft") {
        handlePrevPage();
      } else if (e.key === "ArrowRight") {
        handleNextPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showToc, handlePrevPage, handleNextPage, onClose]);

  if (!isOpen || !magazine) return null;

  // Active page preview data
  const activePageData = magazine.pages?.[currentPage - 1];
  const pageImage = activePageData?.image || magazine.coverImage;

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Reading ${magazine.title}`}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6"
      >
        {/* Backdrop Glassmorphism */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window Container */}
        <motion.div
          ref={modalContainerRef}
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.98, y: 12 }
          }
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.98, y: 12 }
          }
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl h-[95vh] sm:h-[90vh] bg-[#171717] rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden z-10 text-white"
        >
          {/* Reader Top Navigation Bar */}
          <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 bg-[#1F1F1F] border-b border-gray-800 gap-3 z-20">
            {/* Left: Magazine Edition Identity */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF00] shrink-0 animate-pulse" />
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                  {magazine.title}
                </h3>
                <p className="text-[11px] text-gray-400 hidden sm:block truncate">
                  {magazine.edition} • {magazine.categoryLabel}
                </p>
              </div>
            </div>

            {/* Center/Right: Action Buttons & Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Table of Contents Toggle Button */}
              {magazine.pages && magazine.pages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowToc(!showToc)}
                  aria-label="Table of Contents"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    showToc
                      ? "bg-[#00FF00] text-black"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-200"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Contents</span>
                </button>
              )}

              {/* Zoom Controls */}
              <div className="hidden md:flex items-center gap-1 bg-gray-800/80 px-2 py-1 rounded-full border border-gray-700">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 80}
                  aria-label="Zoom out"
                  className="p-1 text-gray-300 hover:text-white disabled:opacity-40 cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-gray-300 w-10 text-center select-none">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 160}
                  aria-label="Zoom in"
                  className="p-1 text-gray-300 hover:text-white disabled:opacity-40 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                {zoomLevel !== 100 && (
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    aria-label="Reset zoom"
                    className="p-1 text-gray-400 hover:text-white ml-0.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Fullscreen Toggle Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                className="hidden sm:inline-flex p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              {/* Direct PDF Download in Reader Header */}
              <a
                href={magazine.pdfAsset}
                download={`${magazine.slug}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white text-black hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF</span>
              </a>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close reader"
                className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Reading Stage & Canvas */}
          <div className="relative flex-1 flex overflow-hidden bg-[#0D0D0D]">
            {/* Table of Contents Drawer (Collapsible) */}
            <AnimatePresence>
              {showToc && magazine.pages && (
                <motion.div
                  initial={{ x: -280, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -280, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-y-0 left-0 z-30 w-72 bg-[#1A1A1A] border-r border-gray-800 flex flex-col shadow-2xl"
                >
                  <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Table of Contents
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowToc(false)}
                      className="p-1 text-gray-400 hover:text-white rounded-md cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {magazine.pages.map((p) => (
                      <button
                        key={p.pageNumber}
                        type="button"
                        onClick={() => {
                          setCurrentPage(p.pageNumber);
                          setShowToc(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl text-xs transition-all cursor-pointer flex items-start gap-2.5 ${
                          currentPage === p.pageNumber
                            ? "bg-[#00FF00]/15 border border-[#00FF00]/40 text-white font-bold"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent"
                        }`}
                      >
                        <span className="font-mono text-emerald-400 shrink-0">
                          {p.pageNumber.toString().padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{p.title}</p>
                          {p.excerpt && (
                            <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                              {p.excerpt}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Left Nav Button */}
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              aria-label="Previous Page"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 shadow-xl disabled:opacity-20 disabled:pointer-events-none transition-all hover:scale-105 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Center: High-Resolution Page Spread Preview Container */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-auto select-none">
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transition: "transform 0.2s ease-out",
                }}
                className="relative max-h-full max-w-full aspect-3/4 rounded-xl shadow-2xl border border-gray-800 overflow-hidden bg-white flex flex-col justify-between"
              >
                {/* Simulated Real Magazine Page Display */}
                <div className="relative w-full h-full min-w-70 sm:min-w-105 md:min-w-125 lg:min-w-140 aspect-3/4">
                  <Image
                    src={pageImage}
                    alt={`${magazine.title} - Page ${currentPage}`}
                    fill
                    priority
                    sizes="(max-width: 768px) 420px, 600px"
                    className="object-cover object-center"
                  />

                  {/* Page Spine Shadow Effect for Editorial Realism */}
                  <div className="absolute inset-y-0 left-0 w-6 bg-linear-to-r from-black/25 to-transparent pointer-events-none" />

                  {/* Content overlay caption on page spreads */}
                  {activePageData && (
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-linear-to-t from-black/90 via-black/50 to-transparent text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#00FF00]">
                          Page {currentPage} of {totalPages}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        {activePageData.title}
                      </h4>
                      {activePageData.excerpt && (
                        <p className="text-xs text-gray-300 mt-1 line-clamp-2 leading-relaxed">
                          {activePageData.excerpt}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Nav Button */}
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              aria-label="Next Page"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 shadow-xl disabled:opacity-20 disabled:pointer-events-none transition-all hover:scale-105 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Reader Bottom Navigation Scrubber Bar */}
          <div className="shrink-0 px-4 sm:px-6 py-3 bg-[#1F1F1F] border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Scrubber Info */}
            <div className="flex items-center gap-2 text-gray-400 font-mono">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>
                Page <strong className="text-white">{currentPage}</strong> of{" "}
                {totalPages}
              </span>
            </div>

            {/* Interactive Slider Scrubber */}
            <div className="flex items-center gap-3 w-full sm:w-80 max-w-sm">
              <span className="text-[11px] text-gray-500 font-mono">1</span>
              <input
                type="range"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value, 10))}
                aria-label="Page slider"
                className="w-full accent-[#00FF00] h-1.5 bg-gray-700 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-gray-500 font-mono">
                {totalPages}
              </span>
            </div>

            {/* Keyboard shortcut hint */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-gray-500">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">
                &larr;
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">
                &rarr;
              </kbd>
              <span>to navigate</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
