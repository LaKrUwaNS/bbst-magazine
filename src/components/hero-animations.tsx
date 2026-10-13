"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * A reusable staggered-children container powered by Framer Motion.
 * Wrap any set of children to get a smooth cascading reveal.
 */
interface HeroAnimationsProps {
  children: React.ReactNode;
  className?: string;
  /** Delay before the stagger begins (seconds) */
  delay?: number;
  /** Stagger interval between children (seconds) */
  stagger?: number;
}

const containerVariants = {
  hidden: {},
  visible: (custom: { delay: number; stagger: number }) => ({
    transition: {
      delayChildren: custom.delay,
      staggerChildren: custom.stagger,
    },
  }),
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export function HeroStagger({
  children,
  className,
  delay = 0.1,
  stagger = 0.12,
}: HeroAnimationsProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      custom={{ delay, stagger }}
    >
      {children}
    </motion.div>
  );
}

export function HeroItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

/**
 * Fade-in + scale entrance for the stats / bottom row.
 */
export function HeroFadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}) {
  const directionMap = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };
  const offset = directionMap[direction];

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        ...offset,
        filter: "blur(6px)",
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        filter: "blur(0px)",
      }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated counter for stat numbers.
 */
export function AnimatedStat({
  label,
  value,
  icon,
  delay = 0,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      className="flex items-center gap-3 cursor-default group"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -3, scale: 1.03 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
    >
      <div className="w-11 h-11 rounded-full flex items-center justify-center text-[#00D800] bg-emerald-50/90 border border-emerald-100/80 group-hover:bg-[#00E500]/20 transition-colors shadow-2xs">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xl sm:text-2xl font-black text-[#171717] leading-none tracking-tight">
          {value}
        </span>
        <span className="text-[11px] font-medium text-gray-500 mt-1">
          {label}
        </span>
      </div>
    </motion.div>
  );
}
