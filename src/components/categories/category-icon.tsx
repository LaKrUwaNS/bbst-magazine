import React from "react";
import {
  FlaskConical,
  Sprout,
  Laptop,
  TrendingUp,
  GraduationCap,
  Users,
  Palette,
  MessageSquare,
  Trophy,
  Lightbulb,
  Folder,
  Award,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  FlaskConical,
  Sprout,
  Laptop,
  TrendingUp,
  GraduationCap,
  Users,
  Palette,
  MessageSquare,
  Trophy,
  Lightbulb,
  Award,
  Folder,
};

export function CategoryIcon({
  name,
  className = "w-5 h-5",
}: {
  name: string;
  className?: string;
}) {
  const IconComponent = ICON_MAP[name] || Folder;
  return <IconComponent className={className} />;
}
