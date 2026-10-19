import { Article, CategoryWithCount } from "@/types/article";

export const MOCK_CATEGORIES: CategoryWithCount[] = [
  {
    id: "cat-1",
    name: "Science & Research",
    slug: "science-research",
    iconName: "FlaskConical",
    count: 12,
  },
  {
    id: "cat-2",
    name: "Agriculture & Environment",
    slug: "agriculture-environment",
    iconName: "Sprout",
    count: 8,
  },
  {
    id: "cat-3",
    name: "Technology & Innovation",
    slug: "technology-innovation",
    iconName: "Laptop",
    count: 15,
  },
  {
    id: "cat-4",
    name: "Business & Entrepreneurship",
    slug: "business-entrepreneurship",
    iconName: "TrendingUp",
    count: 10,
  },
  {
    id: "cat-5",
    name: "Education & Career",
    slug: "education-career",
    iconName: "GraduationCap",
    count: 14,
  },
  {
    id: "cat-6",
    name: "Society & Culture",
    slug: "society-culture",
    iconName: "Users",
    count: 9,
  },
  {
    id: "cat-7",
    name: "Arts & Literature",
    slug: "arts-literature",
    iconName: "Palette",
    count: 7,
  },
  {
    id: "cat-8",
    name: "Interviews & Opinions",
    slug: "interviews-opinions",
    iconName: "MessageSquare",
    count: 11,
  },
  {
    id: "cat-9",
    name: "University Life & Achievements",
    slug: "university-life",
    iconName: "Award",
    count: 6,
  },
  {
    id: "cat-10",
    name: "Projects & Inventions",
    slug: "projects-inventions",
    iconName: "Lightbulb",
    count: 8,
  },
];

export const MOCK_POPULAR_TAGS = [
  "AI",
  "Education",
  "Research",
  "Technology",
  "Innovation",
  "Sustainability",
  "Student Life",
  "Sri Lanka",
  "Environment",
  "Career",
  "Community",
  "University",
  "Agriculture",
  "Startup",
  "Creative Writing",
  "Renewable Energy",
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: "art-1",
    slug: "the-role-of-ai-in-shaping-the-future-of-education",
    title: "The Role of AI in Shaping the Future of Education",
    titleHighlight: "Future of Education",
    excerpt:
      "Exploring how artificial intelligence is transforming learning experiences, supporting students and creating new opportunities in higher education.",
    coverImage: "/images/editorial/technology.jpg",
    category: {
      id: "cat-3",
      name: "Technology & Innovation",
      slug: "technology-innovation",
      iconName: "Laptop",
    },
    author: {
      id: "auth-1",
      name: "Nimsara Jayasuriya",
      department: "Computer Science Department",
      avatar: "/images/avatar1.jpg",
      bio: "Nimsara is an undergraduate student passionate about artificial intelligence, education technology and innovative solutions for real-world problems.",
      socials: {
        linkedin: "https://linkedin.com",
        twitter: "https://x.com",
      },
    },
    publishedAt: "Sep 28, 2025",
    readTime: "8 min read",
    views: "1.2K views",
    readCount: 1240,
    trendingScore: 98,
    isEditorPick: true,
    isTrending: true,
    status: "published",
    tags: [
      "Artificial Intelligence",
      "Education",
      "Technology",
      "Innovation",
      "Higher Education",
    ],
    sections: [
      {
        id: "sec-1",
        heading: "Introduction",
        content: [
          "Artificial intelligence (AI) is rapidly transforming the higher education landscape, offering new opportunities to enhance teaching, learning and research. From personalized learning experiences to intelligent academic support, AI is helping universities create more inclusive and effective education environments.",
          "As students, we are witnessing a significant shift in how knowledge is delivered and accessed. Tools powered by AI can analyze learning patterns, provide real-time feedback and suggest resources tailored to individual needs. This not only improves academic performance but also encourages self-directed learning.",
        ],
      },
      {
        id: "sec-2",
        heading: "Personalized Learning Experiences",
        content: [
          "One of the most promising applications of AI in education is personalized learning. AI systems can identify a student's strengths and weaknesses, then adapt the content, pace and teaching methods accordingly. This helps students focus on areas where they need more support and progress at their own pace.",
          "Adaptive quiz platforms and automated tutoring agents are already assisting thousands of undergraduates in mastering complex algorithmic concepts without feeling overwhelmed by rigid lecture timetables.",
        ],
        quote: {
          text: "Personalized AI mentors empower students to transform passive lecture consumption into active, self-paced mastery.",
          author: "BBST Faculty of Computing Research Group",
        },
      },
      {
        id: "sec-3",
        heading: "Challenges and Ethical Considerations",
        content: [
          "While AI brings many benefits, it also raises important questions about data privacy, bias and the human element in education. Universities must ensure that AI is used responsibly, transparently and ethically, with a focus on supporting rather than replacing human educators.",
          "Academic integrity, algorithmic transparency in evaluation systems, and equitable access across socioeconomic backgrounds remain paramount challenges as higher education adopts these technologies at scale.",
        ],
      },
      {
        id: "sec-4",
        heading: "Conclusion",
        content: [
          "AI has the potential to make education more accessible, engaging and effective. By embracing these technologies thoughtfully, universities can empower students to achieve their goals and prepare for the challenges of the future.",
        ],
      },
    ],
  },
  {
    id: "art-2",
    slug: "innovative-biofertilizer-from-local-resources",
    title: "Innovative Biofertilizer from Local Resources",
    titleHighlight: "Local Resources",
    excerpt:
      "A student research project turning waste into agricultural solutions for a greener future.",
    coverImage: "/images/editorial/agriculture.jpg",
    category: {
      id: "cat-2",
      name: "Agriculture & Environment",
      slug: "agriculture-environment",
      iconName: "Sprout",
    },
    author: {
      id: "auth-2",
      name: "Kasun Wickramasinghe",
      department: "Faculty of Applied Sciences",
      avatar: "/images/avatar2.jpg",
      bio: "Kasun conducts research in microbial biotechnology and sustainable soil enrichment methods.",
    },
    publishedAt: "Sep 15, 2025",
    readTime: "6 min read",
    views: "980 views",
    readCount: 980,
    trendingScore: 92,
    isEditorPick: true,
    isTrending: true,
    status: "published",
    tags: ["Agriculture", "Sustainability", "Environment", "Research", "Biofertilizer"],
    sections: [
      {
        id: "sec-1",
        heading: "Introduction",
        content: [
          "Agricultural sustainability in Sri Lanka requires innovative approaches to soil nutrition that reduce dependence on costly imported chemical fertilizers. Our research team explored harnessing organic agro-processing byproducts to cultivate beneficial bacterial consortia.",
          "By utilizing spent coffee grounds, coconut husk coir dust, and indigenous rock phosphate, the formulated biofertilizer enhances nitrogen fixation and phosphorus solubilization in field trials.",
        ],
      },
      {
        id: "sec-2",
        heading: "Field Trials & Crop Yield Results",
        content: [
          "Comparative field testing demonstrated a 28% increase in root density and a 19% reduction in water stress susceptibility among tomato and leafy vegetable cultivars compared to untreated controls.",
        ],
      },
      {
        id: "sec-3",
        heading: "Conclusion",
        content: [
          "Local circular agricultural solutions prove that high-impact scientific breakthroughs can emerge from affordable, widely available campus resources.",
        ],
      },
    ],
  },
  {
    id: "art-3",
    slug: "student-life-beyond-the-classroom",
    title: "Student Life Beyond the Classroom",
    titleHighlight: "Beyond the Classroom",
    excerpt:
      "Friendships, challenges and lessons that shape our university journey.",
    coverImage: "/images/editorial/campus.jpg",
    category: {
      id: "cat-6",
      name: "Society & Culture",
      slug: "society-culture",
      iconName: "Users",
    },
    author: {
      id: "auth-3",
      name: "Sanduni Fernando",
      department: "Department of Humanities",
      avatar: "/images/avatar3.jpg",
      bio: "Sanduni is a campus photojournalist documenting student culture, festivals, and campus dialogue.",
    },
    publishedAt: "Sep 20, 2025",
    readTime: "5 min read",
    views: "1.5K views",
    readCount: 1510,
    trendingScore: 89,
    isEditorPick: false,
    isTrending: true,
    status: "published",
    tags: ["Student Life", "Community", "University", "Culture"],
    sections: [
      {
        id: "sec-1",
        heading: "Introduction",
        content: [
          "University life is far more than lecture halls, laboratories, and examination schedules. The memories that endure longest are forged during late-night hostel study groups, campus cultural festivals, and spontaneous debates under the shade of campus trees.",
          "Learning to navigate diverse perspectives, manage time under tight deadlines, and build lifelong friendships forms the true curriculum of personal growth.",
        ],
      },
      {
        id: "sec-2",
        heading: "The Power of Campus Clubs and Societies",
        content: [
          "Whether organizing inter-university hackathons, volunteering for community outreach, or rehearsing for drama productions, extracurricular societies provide students with indispensable leadership experience.",
        ],
      },
      {
        id: "sec-3",
        heading: "Conclusion",
        content: [
          "Embrace every facet of the campus journey—academics give you qualifications, but campus life gives you purpose and character.",
        ],
      },
    ],
  },
  {
    id: "art-4",
    slug: "the-future-of-renewable-energy-in-sri-lanka",
    title: "The Future of Renewable Energy in Sri Lanka",
    titleHighlight: "Renewable Energy",
    excerpt:
      "How student research and innovation can support a more sustainable energy future for our country.",
    coverImage: "/images/editorial/science.jpg",
    category: {
      id: "cat-1",
      name: "Science & Research",
      slug: "science-research",
      iconName: "FlaskConical",
    },
    author: {
      id: "auth-4",
      name: "Dulanjana Perera",
      department: "Faculty of Engineering",
      avatar: "/images/avatar4.jpg",
      bio: "Dulanjana specializes in renewable power integration and microgrid storage optimization.",
    },
    publishedAt: "Sep 12, 2025",
    readTime: "7 min read",
    views: "890 views",
    readCount: 890,
    trendingScore: 84,
    isEditorPick: true,
    isTrending: false,
    status: "published",
    tags: ["Renewable Energy", "Sri Lanka", "Sustainability", "Innovation", "Research"],
    sections: [
      {
        id: "sec-1",
        heading: "Introduction",
        content: [
          "With abundant tropical solar irradiance and coastal wind corridors, Sri Lanka possesses exceptional potential to reach 70% renewable generation before 2030.",
          "Our university engineering lab has been testing decentralized solar-plus-storage mini-grids to stabilize power supplies for rural agricultural communities.",
        ],
      },
      {
        id: "sec-2",
        heading: "Smart Grid Innovations & Battery Chemistry",
        content: [
          "Student projects exploring sodium-ion storage alternatives and intelligent demand-response forecasting have demonstrated feasibility for peak load shaving without diesel reliance.",
        ],
      },
      {
        id: "sec-3",
        heading: "Conclusion",
        content: [
          "Transitioning to green energy is not solely an environmental prerogative; it is an economic cornerstone for our national resilience.",
        ],
      },
    ],
  },
  {
    id: "art-5",
    slug: "how-to-turn-a-student-project-into-a-real-startup",
    title: "How to Turn a Student Project into a Real Startup",
    titleHighlight: "Real Startup",
    excerpt:
      "Practical lessons, tools and inspiring stories for students who want to build something of their own.",
    coverImage: "/images/editorial/technology.jpg",
    category: {
      id: "cat-4",
      name: "Business & Entrepreneurship",
      slug: "business-entrepreneurship",
      iconName: "TrendingUp",
    },
    author: {
      id: "auth-5",
      name: "Tharindu Silva",
      department: "Faculty of Management",
      avatar: "/images/avatar1.jpg",
      bio: "Co-founder of campus incubator VenturesHub and student startup advisor.",
    },
    publishedAt: "Sep 8, 2025",
    readTime: "6 min read",
    views: "1.1K views",
    readCount: 1120,
    trendingScore: 88,
    isEditorPick: false,
    isTrending: true,
    status: "published",
    tags: ["Startup", "Entrepreneurship", "Innovation", "Career"],
    sections: [
      {
        id: "sec-1",
        heading: "Introduction",
        content: [
          "Every semester, hundreds of remarkable final-year capstone projects gather dust after grading. Transforming your academic prototype into a commercial venture is simpler than you might expect with the right mindset.",
          "From validating consumer demand to securing seed grants, student founders have distinct advantages: access to campus labs, mentoring professors, and lower initial overhead.",
        ],
      },
      {
        id: "sec-2",
        heading: "Key Steps for Student Founders",
        content: [
          "1. Validate problem-solution fit before writing code.\n2. Protect intellectual property through the university technology transfer office.\n3. Build a multidisciplinary founding team uniting engineers, designers, and marketers.",
        ],
      },
      {
        id: "sec-3",
        heading: "Conclusion",
        content: [
          "Do not wait for graduation to build your vision. The best time to launch is while you have the support of your university community.",
        ],
      },
    ],
  },
  {
    id: "art-6",
    slug: "creative-writing-as-a-tool-for-self-expression",
    title: "Creative Writing as a Tool for Self Expression",
    titleHighlight: "Self Expression",
    excerpt:
      "Exploring how creative writing helps students express their thoughts, emotions and unique perspectives.",
    coverImage: "/images/editorial/arts.jpg",
    category: {
      id: "cat-7",
      name: "Arts & Literature",
      slug: "arts-literature",
      iconName: "Palette",
    },
    author: {
      id: "auth-6",
      name: "Yashoda Wijesinghe",
      department: "Faculty of Arts & Languages",
      avatar: "/images/avatar2.jpg",
      bio: "Poet, editor, and winner of the Inter-University Literary Circle Prize.",
    },
    publishedAt: "Aug 28, 2025",
    readTime: "4 min read",
    views: "640 views",
    readCount: 640,
    trendingScore: 72,
    isEditorPick: false,
    isTrending: false,
    status: "published",
    tags: ["Creative Writing", "Arts", "Literature", "Community"],
    sections: [
      {
        id: "sec-1",
        heading: "Introduction",
        content: [
          "In an increasingly digitized world driven by metrics and algorithms, the intimate act of putting pen to paper remains an irreplaceable sanctuary.",
          "Creative writing provides an outlet to synthesize raw academic stress into meaningful narratives, poetry, and reflective memoirs.",
        ],
      },
      {
        id: "sec-2",
        heading: "Finding Your Authentic Literary Voice",
        content: [
          "Writing is not about adhering to rigid conventions; it is about telling the stories that only you can tell. Our campus literary gazette exists to celebrate voices from every faculty.",
        ],
      },
      {
        id: "sec-3",
        heading: "Conclusion",
        content: [
          "Pick up your notebook today. Your words matter, and our community is eager to hear them.",
        ],
      },
    ],
  },
  {
    id: "art-7",
    slug: "career-readiness-in-modern-higher-education",
    title: "Career Readiness in Modern Higher Education",
    titleHighlight: "Career Readiness",
    excerpt:
      "Bridging the gap between academic curricula and evolving industry expectations for graduates.",
    coverImage: "/images/editorial/campus.jpg",
    category: {
      id: "cat-5",
      name: "Education & Career",
      slug: "education-career",
      iconName: "GraduationCap",
    },
    author: {
      id: "auth-7",
      name: "Chathura Bandara",
      department: "Career Guidance Unit",
      avatar: "/images/avatar3.jpg",
      bio: "Industry liaison officer helping students prepare for multinational tech and research careers.",
    },
    publishedAt: "Sep 22, 2025",
    readTime: "5 min read",
    views: "780 views",
    readCount: 780,
    trendingScore: 81,
    isEditorPick: true,
    isTrending: false,
    status: "published",
    tags: ["Career", "Education", "University"],
    sections: [
      {
        id: "sec-1",
        heading: "Introduction",
        content: [
          "Technical proficiencies are necessary, but employers increasingly seek adaptive problem-solvers who can communicate clearly and collaborate across cross-functional teams.",
        ],
      },
      {
        id: "sec-2",
        heading: "Essential Soft Skills for Graduates",
        content: [
          "Cultivating critical thinking, emotional intelligence, and continuous self-learning habits gives graduates a decisive edge in dynamic job markets.",
        ],
      },
      {
        id: "sec-3",
        heading: "Conclusion",
        content: [
          "Pair your degree with hands-on internship experiences and professional networking early in your academic journey.",
        ],
      },
    ],
  },
  {
    id: "art-8",
    slug: "voices-of-innovation-campus-tech-leaders-interview",
    title: "Voices of Innovation: Campus Tech Leaders Interview",
    titleHighlight: "Campus Tech Leaders",
    excerpt:
      "A candid conversation with campus innovators on student empowerment and collaborative research.",
    coverImage: "/images/editorial/science.jpg",
    category: {
      id: "cat-8",
      name: "Interviews & Opinions",
      slug: "interviews-opinions",
      iconName: "MessageSquare",
    },
    author: {
      id: "auth-8",
      name: "Malithi Ranasinghe",
      department: "Editorial Board Member",
      avatar: "/images/avatar4.jpg",
      bio: "Senior editor conducting interviews with leading student innovators and alumni.",
    },
    publishedAt: "Sep 18, 2025",
    readTime: "9 min read",
    views: "1.3K views",
    readCount: 1300,
    trendingScore: 94,
    isEditorPick: true,
    isTrending: true,
    status: "published",
    tags: ["Interviews", "Innovation", "Technology", "University"],
    sections: [
      {
        id: "sec-1",
        heading: "Introduction",
        content: [
          "In this special feature, we sit down with three student leads who developed award-winning robotics and AI systems for national competitions.",
        ],
      },
      {
        id: "sec-2",
        heading: "Balancing Rigorous Academics with Visionary Projects",
        content: [
          "The interviewees discuss time management, overcoming equipment shortages, and the thrill of seeing real campus impact.",
        ],
      },
      {
        id: "sec-3",
        heading: "Conclusion",
        content: [
          "Student passion and peer mentorship continue to drive our campus toward remarkable innovation milestones.",
        ],
      },
    ],
  },
  {
    id: "art-9",
    slug: "autonomous-greenhouse-monitoring-system",
    title: "Autonomous Greenhouse Monitoring System",
    titleHighlight: "Monitoring System",
    excerpt:
      "IoT sensors and robotics designed by undergraduates to optimize microclimates in vertical farms.",
    coverImage: "/images/editorial/agriculture.jpg",
    category: {
      id: "cat-10",
      name: "Projects & Inventions",
      slug: "projects-inventions",
      iconName: "Lightbulb",
    },
    author: {
      id: "auth-9",
      name: "Nuwan Senanayake",
      department: "Robotics & Automation Society",
      avatar: "/images/avatar1.jpg",
      bio: "Undergraduate researcher combining embedded electronics with precision agriculture.",
    },
    publishedAt: "Sep 10, 2025",
    readTime: "6 min read",
    views: "850 views",
    readCount: 850,
    trendingScore: 86,
    isEditorPick: false,
    isTrending: false,
    status: "published",
    tags: ["Projects", "Innovation", "Agriculture", "Technology"],
    sections: [
      {
        id: "sec-1",
        heading: "Introduction",
        content: [
          "Climate fluctuations pose severe risks to vulnerable seedlings in high-yield poly-tunnels. Our robotics club built an affordable autonomous rover that monitors soil moisture, temperature, and leaf canopy health.",
        ],
      },
      {
        id: "sec-2",
        heading: "Sensor Array and Autonomous Navigation",
        content: [
          "Using low-cost LiDAR and ESP32 microcontrollers, the system communicates wirelessly with a central server to trigger automated misting and nutrient dosing.",
        ],
      },
      {
        id: "sec-3",
        heading: "Conclusion",
        content: [
          "Undergraduate inventions demonstrate how smart farming technologies can be made accessible to smallholder farmers nationwide.",
        ],
      },
    ],
  },
  {
    id: "art-10",
    slug: "building-a-more-inclusive-campus-community",
    title: "Building a More Inclusive Campus Community",
    titleHighlight: "Inclusive Campus",
    excerpt:
      "How student-led accessibility initiatives are breaking barriers across academic and social life.",
    coverImage: "/images/editorial/campus.jpg",
    category: {
      id: "cat-9",
      name: "University Life & Achievements",
      slug: "university-life",
      iconName: "Award",
    },
    author: {
      id: "auth-10",
      name: "Dinithi Samaraweera",
      department: "Student Affairs Committee",
      avatar: "/images/avatar2.jpg",
      bio: "Advocate for universal campus accessibility and peer-support networks.",
    },
    publishedAt: "Aug 20, 2025",
    readTime: "5 min read",
    views: "920 views",
    readCount: 920,
    trendingScore: 78,
    isEditorPick: false,
    isTrending: false,
    status: "published",
    tags: ["University", "Community", "Student Life"],
    sections: [
      {
        id: "sec-1",
        heading: "Introduction",
        content: [
          "An exceptional university thrives on belonging. Over the past academic year, student unions spearheaded an audit of campus ramps, digital screen readers, and peer mental health circles.",
        ],
      },
      {
        id: "sec-2",
        heading: "Actionable Milestones Achieved",
        content: [
          "Braille signage installation across library wings and student-volunteer audio recording of study guides have made education far more accessible for all peers.",
        ],
      },
      {
        id: "sec-3",
        heading: "Conclusion",
        content: [
          "Every small step toward inclusivity enriches the academic and cultural vitality of the entire student body.",
        ],
      },
    ],
  },
];
