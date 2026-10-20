import { CategoryDetailItem } from "@/types/category";

export const CATEGORY_METADATA: Record<
  string,
  {
    description: string;
    iconName: string;
    image: string;
    isFeatured: boolean;
  }
> = {
  "science-research": {
    description:
      "Scientific breakthroughs, lab dissertations, biochemical analyses, and analytical research spearheaded by undergraduates.",
    iconName: "FlaskConical",
    image: "/images/editorial/science.jpg",
    isFeatured: true,
  },
  "agriculture-environment": {
    description:
      "Sustainable agri-systems, climate resilience, smart irrigation, and highland ecological restoration in Sri Lanka.",
    iconName: "Sprout",
    image: "/images/editorial/agriculture.jpg",
    isFeatured: true,
  },
  "technology-innovation": {
    description:
      "Artificial intelligence, automated robotics, loT telemetry, software architectures, and student engineering prototypes.",
    iconName: "Laptop",
    image: "/images/editorial/technology.jpg",
    isFeatured: true,
  },
  "business-entrepreneurship": {
    description:
      "Student startup founders, agribusiness commercialization, campus incubators, and university venture funding insights.",
    iconName: "TrendingUp",
    image: "/images/articles-campus-hero.png",
    isFeatured: true,
  },
  "education-career": {
    description:
      "Postgraduate pathways, industry internships, skill acquisitions, and professional career guidance from faculty alumni.",
    iconName: "GraduationCap",
    image: "/images/editorial/campus.jpg",
    isFeatured: false,
  },
  "society-culture": {
    description:
      "Campus traditions, community outreach, student welfare, inclusivity dialogues, and university social engagements.",
    iconName: "Users",
    image: "/images/uva-imageee.jpg",
    isFeatured: false,
  },
  "arts-literature": {
    description:
      "Poetic anthologies, landscape photography of the Namunukula range, short fiction, and traditional creative crafts.",
    iconName: "Palette",
    image: "/images/editorial/arts.jpg",
    isFeatured: false,
  },
  "interviews-opinions": {
    description:
      "In-depth discussions with deans, visiting scholars, innovative professors, and influential student union leaders.",
    iconName: "MessageSquare",
    image: "/images/Hero Backgorund.png",
    isFeatured: false,
  },
  "university-life": {
    description:
      "Celebrations of campus spirit, annual sports meets, hackathon victories, and milestones in university student history.",
    iconName: "Trophy",
    image: "/images/editorial/campus.jpg",
    isFeatured: false,
  },
  "university-life-achievements": {
    description:
      "Celebrations of campus spirit, annual sports meets, hackathon victories, and milestones in university student history.",
    iconName: "Trophy",
    image: "/images/editorial/campus.jpg",
    isFeatured: false,
  },
  "projects-inventions": {
    description:
      "Undergraduate capstone prototypes, environmental sensors, autonomous rovers, and hands-on laboratory inventions.",
    iconName: "Lightbulb",
    image: "/images/editorial/technology.jpg",
    isFeatured: false,
  },
};

export const FALLBACK_CATEGORIES: CategoryDetailItem[] = [
  {
    id: "cat-1",
    name: "Science & Research",
    slug: "science-research",
    description: CATEGORY_METADATA["science-research"].description,
    iconName: CATEGORY_METADATA["science-research"].iconName,
    image: CATEGORY_METADATA["science-research"].image,
    articleCount: 12,
    isFeatured: true,
  },
  {
    id: "cat-2",
    name: "Agriculture & Environment",
    slug: "agriculture-environment",
    description: CATEGORY_METADATA["agriculture-environment"].description,
    iconName: CATEGORY_METADATA["agriculture-environment"].iconName,
    image: CATEGORY_METADATA["agriculture-environment"].image,
    articleCount: 8,
    isFeatured: true,
  },
  {
    id: "cat-3",
    name: "Technology & Innovation",
    slug: "technology-innovation",
    description: CATEGORY_METADATA["technology-innovation"].description,
    iconName: CATEGORY_METADATA["technology-innovation"].iconName,
    image: CATEGORY_METADATA["technology-innovation"].image,
    articleCount: 15,
    isFeatured: true,
  },
  {
    id: "cat-4",
    name: "Business & Entrepreneurship",
    slug: "business-entrepreneurship",
    description: CATEGORY_METADATA["business-entrepreneurship"].description,
    iconName: CATEGORY_METADATA["business-entrepreneurship"].iconName,
    image: CATEGORY_METADATA["business-entrepreneurship"].image,
    articleCount: 10,
    isFeatured: true,
  },
  {
    id: "cat-5",
    name: "Education & Career",
    slug: "education-career",
    description: CATEGORY_METADATA["education-career"].description,
    iconName: CATEGORY_METADATA["education-career"].iconName,
    image: CATEGORY_METADATA["education-career"].image,
    articleCount: 14,
    isFeatured: false,
  },
  {
    id: "cat-6",
    name: "Society & Culture",
    slug: "society-culture",
    description: CATEGORY_METADATA["society-culture"].description,
    iconName: CATEGORY_METADATA["society-culture"].iconName,
    image: CATEGORY_METADATA["society-culture"].image,
    articleCount: 9,
    isFeatured: false,
  },
  {
    id: "cat-7",
    name: "Arts & Literature",
    slug: "arts-literature",
    description: CATEGORY_METADATA["arts-literature"].description,
    iconName: CATEGORY_METADATA["arts-literature"].iconName,
    image: CATEGORY_METADATA["arts-literature"].image,
    articleCount: 7,
    isFeatured: false,
  },
  {
    id: "cat-8",
    name: "Interviews & Opinions",
    slug: "interviews-opinions",
    description: CATEGORY_METADATA["interviews-opinions"].description,
    iconName: CATEGORY_METADATA["interviews-opinions"].iconName,
    image: CATEGORY_METADATA["interviews-opinions"].image,
    articleCount: 11,
    isFeatured: false,
  },
  {
    id: "cat-9",
    name: "University Life & Achievements",
    slug: "university-life",
    description: CATEGORY_METADATA["university-life"].description,
    iconName: CATEGORY_METADATA["university-life"].iconName,
    image: CATEGORY_METADATA["university-life"].image,
    articleCount: 6,
    isFeatured: false,
  },
  {
    id: "cat-10",
    name: "Projects & Inventions",
    slug: "projects-inventions",
    description: CATEGORY_METADATA["projects-inventions"].description,
    iconName: CATEGORY_METADATA["projects-inventions"].iconName,
    image: CATEGORY_METADATA["projects-inventions"].image,
    articleCount: 8,
    isFeatured: false,
  },
];
