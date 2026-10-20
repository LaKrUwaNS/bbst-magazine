"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FileText, BookOpen, Users, Layers, TrendingUp } from "lucide-react";

export interface AboutStatsProps {
  articlesCount: number;
  magazinesCount: number;
  contributorsCount: number;
  categoriesCount: number;
}

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ElementType;
  description: string;
}

function Counter({ targetValue, suffix = "" }: { targetValue: number; suffix?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) return;

    let start = 0;
    const duration = 1200; // ms
    const stepTime = 20; // 50 updates per sec
    const totalSteps = duration / stepTime;
    const increment = targetValue / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetValue) {
        setCount(targetValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetValue, shouldReduceMotion]);

  const displayCount = shouldReduceMotion ? targetValue : count;

  return (
    <span className="font-black tracking-tight text-[#171717]">
      {displayCount}
      {suffix}
    </span>
  );
}

export function AboutStats({
  articlesCount,
  magazinesCount,
  contributorsCount,
  categoriesCount,
}: AboutStatsProps) {
  const shouldReduceMotion = useReducedMotion();

  const stats: StatItem[] = [
    {
      label: "Published Articles",
      value: articlesCount > 0 ? articlesCount : 10,
      suffix: "+",
      icon: FileText,
      description: "Peer-reviewed student research, technology features, and creative essays.",
    },
    {
      label: "Magazine Editions",
      value: magazinesCount > 0 ? magazinesCount : 5,
      suffix: "",
      icon: BookOpen,
      description: "Complete print and digital magazine issues published and archived.",
    },
    {
      label: "Community Contributors",
      value: contributorsCount > 0 ? contributorsCount : 12,
      suffix: "+",
      icon: Users,
      description: "Student writers, researchers, photojournalists, and faculty advisors.",
    },
    {
      label: "Knowledge Categories",
      value: categoriesCount > 0 ? categoriesCount : 10,
      suffix: "",
      icon: Layers,
      description: "Distinct fields of inquiry spanning applied sciences, agri-tech, and arts.",
    },
  ];

  return (
    <section className="py-20 lg:py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Verified Platform Reach
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
            Our Growing Impact in Numbers
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Real metrics reflecting publication activity and student community participation
            at Uva Wellassa University.
          </p>
        </div>

        {/* 4 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className="group relative p-8 rounded-3xl bg-linear-to-b from-gray-50/70 via-white to-white border border-gray-200/80 hover:border-[#00C800] hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 mb-6 group-hover:scale-105 group-hover:bg-[#00E500] group-hover:text-black transition-all">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Value */}
                  <div className="text-4xl sm:text-5xl mb-2 flex items-baseline gap-1">
                    <Counter targetValue={stat.value} suffix={stat.suffix} />
                  </div>

                  {/* Label */}
                  <h3 className="text-base font-bold text-[#171717] mb-2 tracking-tight">
                    {stat.label}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {stat.description}
                  </p>
                </div>

                {/* Bottom line accent */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E500]" />
                  <span>Verified Platform Metric</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
