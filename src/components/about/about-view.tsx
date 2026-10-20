"use client";

import React from "react";
import { AboutHero } from "./about-hero";
import { AboutStory } from "./about-story";
import { AboutMissionVision } from "./about-mission-vision";
import { AboutValues } from "./about-values";
import { AboutGallery } from "./about-gallery";
import { AboutStats } from "./about-stats";
import { AboutTeam, TeamMember } from "./about-team";
import { AboutCTA } from "./about-cta";

interface AboutViewProps {
  articlesCount: number;
  magazinesCount: number;
  contributorsCount: number;
  categoriesCount: number;
  teamMembers?: TeamMember[];
}

export function AboutView({
  articlesCount,
  magazinesCount,
  contributorsCount,
  categoriesCount,
  teamMembers,
}: AboutViewProps) {
  return (
    <div className="w-full bg-white text-[#171717] selection:bg-[#00E500] selection:text-black">
      {/* 1. Immersive Hero Section */}
      <AboutHero
        totalMagazines={magazinesCount}
        totalArticles={articlesCount}
      />

      {/* 2. Editorial Storytelling */}
      <AboutStory />

      {/* 3. Our Mission & Vision */}
      <AboutMissionVision />

      {/* 4. What Makes BBST Magazine Special? (Values) */}
      <AboutValues />

      {/* 5. A Visual Journey Through Our Community (Gallery) */}
      <AboutGallery />

      {/* 6. Magazine Impact and Statistics */}
      <AboutStats
        articlesCount={articlesCount}
        magazinesCount={magazinesCount}
        contributorsCount={contributorsCount}
        categoriesCount={categoriesCount}
      />

      {/* 7. Meet the Editorial Team */}
      <AboutTeam customMembers={teamMembers} />

      {/* 8. Join the BBST Magazine Community (CTA) */}
      <AboutCTA />
    </div>
  );
}
