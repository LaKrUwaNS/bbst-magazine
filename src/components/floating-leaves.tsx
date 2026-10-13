"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Configuration for static ambient leaves that gently hover in place
 * to match the reference composition's atmospheric balance.
 */
interface AmbientLeafConfig {
  id: string;
  src: string;
  className: string;
  xDrift: [number, number];
  yDrift: [number, number];
  rotate: [number, number, number];
  opacity: [number, number, number];
  duration: number;
  filter?: string;
}

const AMBIENT_LEAVES: AmbientLeafConfig[] = [
  {
    id: "amb-left-top",
    src: "/images/Leaf1.png",
    className:
      "absolute top-[8%] left-[1%] w-8 sm:w-11 aspect-square drop-shadow-xs",
    xDrift: [0, 12],
    yDrift: [0, 15],
    rotate: [-45, -28, -45],
    opacity: [0.75, 0.9, 0.75],
    duration: 8.5,
  },
  {
    id: "amb-left-bottom",
    src: "/images/Leaf2.png",
    className:
      "absolute top-[82%] left-[1.2%] w-9 sm:w-12 aspect-square drop-shadow-xs",
    xDrift: [0, -10],
    yDrift: [0, 18],
    rotate: [15, -10, 15],
    opacity: [0.7, 0.88, 0.7],
    duration: 11,
  },
  {
    id: "amb-right-top",
    src: "/images/Leaf1.png",
    className:
      "absolute top-[8%] right-[6%] w-10 sm:w-13 aspect-square drop-shadow-sm hidden sm:block",
    xDrift: [0, 14],
    yDrift: [0, -12],
    rotate: [55, 35, 55],
    opacity: [0.8, 0.95, 0.8],
    duration: 8,
  },
  {
    id: "amb-right-bottom",
    src: "/images/Leaf2.png",
    className:
      "absolute top-[75%] right-[2%] w-9 sm:w-12 aspect-square drop-shadow-xs",
    xDrift: [0, -12],
    yDrift: [0, 14],
    rotate: [-28, -8, -28],
    opacity: [0.65, 0.85, 0.65],
    duration: 10,
  },
  {
    id: "amb-top-depth",
    src: "/images/Leaf1.png",
    className:
      "absolute top-[4%] left-[28%] w-6 sm:w-8 aspect-square drop-shadow-xs hidden lg:block opacity-45",
    xDrift: [0, 8],
    yDrift: [0, -8],
    rotate: [-15, 5, -15],
    opacity: [0.4, 0.55, 0.4],
    duration: 9.5,
    filter: "blur(1.5px)",
  },
];

/**
 * Configuration for leaves falling down and disappearing off the sides of the screen.
 * Each falling leaf follows an organic 3D fluttering trajectory with staggered
 * timing, realistic sine-wave sway, and side-exit fade.
 *
 * Trajectories are positioned in the ambient outer margins and column gaps
 * to ensure zero visual overlap with the hero heading, paragraph, and CTA buttons.
 */
interface FallingLeafConfig {
  id: string;
  src: string;
  sizeClass: string;
  startLeft: string; // Left horizontal anchor
  swayX: number[]; // Horizontal breeze path drifting towards margins
  rotateZ: number[]; // Angular roll
  rotateY?: number[]; // 3D page flip
  rotateX?: number[]; // 3D pitch
  opacity: number[]; // Entrance, visible float, and side exit fade out
  duration: number; // Time in seconds to complete the descent
  delay: number; // Stagger offset in seconds
  filter?: string; // Optional optical depth of field blur
  zIndex: number;
}

const FALLING_LEAVES: FallingLeafConfig[] = [
  // 1. Far-left perimeter leaf drifting down along the screen edge
  {
    id: "fall-far-left",
    src: "/images/Leaf1.png",
    sizeClass: "w-9 sm:w-12",
    startLeft: "3%",
    swayX: [0, 16, -12, 18, -25, -60],
    rotateZ: [20, 65, -15, 75, -20, 110],
    rotateY: [0, 160, 320],
    opacity: [0, 0.85, 0.85, 0.7, 0.25, 0],
    duration: 12,
    delay: 0,
    zIndex: 1,
  },
  // 2. Far-left flank leaf drifting along the outer edge
  {
    id: "fall-far-left-edge",
    src: "/images/Leaf2.png",
    sizeClass: "w-8 sm:w-10",
    startLeft: "7%",
    swayX: [0, -10, 14, -12, -35, -75],
    rotateZ: [35, -55, 45, -30, 70],
    opacity: [0, 0.75, 0.75, 0.5, 0.1, 0],
    duration: 11,
    delay: 5.5,
    zIndex: 1,
  },
  // 3. Center gap leaf falling cleanly between the left text column and right magazine
  {
    id: "fall-column-gap",
    src: "/images/Leaf2.png",
    sizeClass: "w-9 sm:w-11",
    startLeft: "51%",
    swayX: [0, 18, -14, 20, -12, 25],
    rotateZ: [40, -15, 55, -10, 75, 20],
    opacity: [0, 0.8, 0.8, 0.6, 0.15, 0],
    duration: 14,
    delay: 3.5,
    zIndex: 1,
  },
  // 4. Right side leaf fluttering near the magazine outer flank
  {
    id: "fall-right-outer",
    src: "/images/Leaf1.png",
    sizeClass: "w-10 sm:w-13",
    startLeft: "76%",
    swayX: [0, 24, -18, 28, 20, 75],
    rotateZ: [-25, 45, -35, 50, -18, 70],
    opacity: [0, 0.85, 0.85, 0.65, 0.2, 0],
    duration: 13,
    delay: 7.0,
    zIndex: 1,
  },
  // 5. Far-right flank leaf drifting off the right edge
  {
    id: "fall-far-right",
    src: "/images/Leaf2.png",
    sizeClass: "w-11 sm:w-14",
    startLeft: "88%",
    swayX: [0, -22, 25, -15, 45, 110],
    rotateZ: [-35, 20, -45, 30, -55, 85],
    rotateY: [0, 140, 280, 360],
    opacity: [0, 0.88, 0.88, 0.7, 0.2, 0],
    duration: 12.5,
    delay: 2.0,
    zIndex: 1,
  },
  // 6. Deep background blurred leaf on right side for depth of field
  {
    id: "fall-blur-depth",
    src: "/images/Leaf2.png",
    sizeClass: "w-7 sm:w-9",
    startLeft: "65%",
    swayX: [0, -16, 20, -10, 32, 65],
    rotateZ: [20, -35, 25, -45, 50],
    opacity: [0, 0.5, 0.55, 0.38, 0.1, 0],
    duration: 16,
    delay: 8.5,
    filter: "blur(1.8px)",
    zIndex: 0,
  },
  // 7. Extreme far right flutter
  {
    id: "fall-extreme-right",
    src: "/images/Leaf1.png",
    sizeClass: "w-8 sm:w-10",
    startLeft: "95%",
    swayX: [0, -14, 18, -10, 30, 65],
    rotateZ: [-30, 48, -35, 55, -15],
    opacity: [0, 0.75, 0.75, 0.45, 0.1, 0],
    duration: 11,
    delay: 9.5,
    zIndex: 1,
  },
];

export function FloatingLeaves() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0"
      >
        {AMBIENT_LEAVES.slice(0, 3).map((leaf) => (
          <div key={leaf.id} className={leaf.className}>
            <Image
              src={leaf.src}
              alt=""
              fill
              sizes="48px"
              className="object-contain"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0 perspective-[1000px]"
    >
      {/* ======================================================== */}
      {/* 1. Ambient Floating Leaves (Gentle localized hovering)  */}
      {/* ======================================================== */}
      {AMBIENT_LEAVES.map((leaf) => (
        <motion.div
          key={leaf.id}
          className={leaf.className}
          style={leaf.filter ? { filter: leaf.filter } : undefined}
          initial={{
            x: leaf.xDrift[0],
            y: leaf.yDrift[0],
            rotate: leaf.rotate[0],
            opacity: leaf.opacity[0],
          }}
          animate={{
            x: [leaf.xDrift[0], leaf.xDrift[1], leaf.xDrift[0]],
            y: [leaf.yDrift[0], leaf.yDrift[1], leaf.yDrift[0]],
            rotate: leaf.rotate,
            opacity: leaf.opacity,
          }}
          transition={{
            duration: leaf.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Image
            src={leaf.src}
            alt=""
            fill
            sizes="64px"
            className="object-contain"
          />
        </motion.div>
      ))}

      {/* ======================================================== */}
      {/* 2. Falling Leaves (Falling down & disappearing from sides)*/}
      {/* ======================================================== */}
      {FALLING_LEAVES.map((leaf) => (
        <motion.div
          key={leaf.id}
          className={`absolute top-0 aspect-square ${leaf.sizeClass} drop-shadow-sm will-change-transform`}
          style={{
            left: leaf.startLeft,
            zIndex: leaf.zIndex,
            filter: leaf.filter,
          }}
          initial={{
            y: "-80px",
            x: 0,
            rotateZ: leaf.rotateZ[0],
            opacity: 0,
          }}
          animate={{
            y: ["-80px", "110vh"],
            x: leaf.swayX,
            rotateZ: leaf.rotateZ,
            rotateY: leaf.rotateY ?? [0, 180, 360],
            rotateX: leaf.rotateX ?? [0, 20, 0],
            opacity: leaf.opacity,
          }}
          transition={{
            duration: leaf.duration,
            repeat: Infinity,
            delay: leaf.delay,
            ease: "linear",
          }}
        >
          <Image
            src={leaf.src}
            alt=""
            fill
            sizes="(max-width: 640px) 44px, 64px"
            className="object-contain"
          />
        </motion.div>
      ))}
    </div>
  );
}
