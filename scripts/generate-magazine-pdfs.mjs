import fs from "fs";
import path from "path";

/**
 * Generates authentic multi-page A4 PDF files using raw PDF-1.4 format.
 * High quality typography, precise vector coordinates, header bands and footers.
 */
function createMultiPagePdf(pagesData, magazineName) {
  const objects = [];
  let currentOffset = 0;
  const offsets = [];

  function addObject(content) {
    const objNum = objects.length + 1;
    offsets.push(currentOffset);
    const str = `${objNum} 0 obj\n${content}\nendobj\n`;
    objects.push(str);
    currentOffset += Buffer.byteLength(str, "utf8");
    return objNum;
  }

  // Header
  const header = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  currentOffset = Buffer.byteLength(header, "utf8");

  const pageCount = pagesData.length;
  const pageObjNums = [];

  for (let i = 0; i < pageCount; i++) {
    pageObjNums.push(5 + i * 2);
  }

  // 1: Catalog
  addObject("<< /Type /Catalog /Pages 2 0 R >>");

  // 2: Pages
  const kidsStr = pageObjNums.map((n) => `${n} 0 R`).join(" ");
  addObject(`<< /Type /Pages /Kids [${kidsStr}] /Count ${pageCount} >>`);

  // 3: FontBold
  addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  // 4: FontRegular
  addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  // Pages and Content streams
  for (let i = 0; i < pageCount; i++) {
    const p = pagesData[i];
    const pageObjNum = 5 + i * 2;
    const contentObjNum = pageObjNum + 1;

    // Page object (A4: 595 x 842 pt)
    addObject(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentObjNum} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>`
    );

    // Build content stream with graphics and text
    let streamText = "";

    // Background header accent bar
    streamText += "q\n";
    streamText += "0.0 0.8 0.2 rg\n"; // vibrant emerald green
    streamText += "40 805 515 4 re f\n";
    streamText += "0.95 0.95 0.95 rg\n";
    streamText += "40 765 515 35 re f\n"; // subtle header background
    streamText += "Q\n";

    // Text Header
    streamText += "BT\n";
    streamText += "/F1 10 Tf\n0.3 0.3 0.3 rg\n";
    streamText += "1 0 0 1 45 778 Tm\n";
    streamText += `(${escapePdfText(magazineName.toUpperCase())}) Tj\n`;

    // Title
    streamText += "/F1 20 Tf\n0.09 0.09 0.09 rg\n";
    streamText += "1 0 0 1 45 730 Tm\n";
    streamText += `(${escapePdfText(p.title)}) Tj\n`;

    // Subtitle
    let currentY = 730;
    if (p.subtitle) {
      currentY -= 26;
      streamText += "/F1 11 Tf\n0.0 0.55 0.2 rg\n";
      streamText += `1 0 0 1 45 ${currentY} Tm\n`;
      streamText += `(${escapePdfText(p.subtitle)}) Tj\n`;
    }

    // Body Lines
    currentY -= 35;
    streamText += "/F2 10 Tf\n0.2 0.2 0.2 rg\n";
    for (const paragraph of p.paragraphs) {
      streamText += `1 0 0 1 45 ${currentY} Tm\n`;
      streamText += `(${escapePdfText(paragraph)}) Tj\n`;
      currentY -= 22;
    }

    // Footer rule & text
    streamText += "ET\n";
    streamText += "q\n0.85 0.85 0.85 rg\n40 50 515 1 re f\nQ\n";
    streamText += "BT\n";
    streamText += "/F1 8 Tf\n0.5 0.5 0.5 rg\n";
    streamText += "1 0 0 1 45 35 Tm\n";
    streamText += `(BBST Magazine  |  Page ${i + 1} of ${pageCount}  |  Faculty of Technological Studies, Uva Wellassa University) Tj\n`;
    streamText += "ET\n";

    const streamLength = Buffer.byteLength(streamText, "utf8");
    addObject(`<< /Length ${streamLength} >>\nstream\n${streamText}endstream`);
  }

  // Cross Reference Table
  const startXref = currentOffset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (const offset of offsets) {
    const padded = String(offset).padStart(10, "0");
    xref += `${padded} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return Buffer.concat([
    Buffer.from(header, "utf8"),
    ...objects.map((o) => Buffer.from(o, "utf8")),
    Buffer.from(xref, "utf8"),
    Buffer.from(trailer, "utf8"),
  ]);
}

function escapePdfText(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, " ");
}

const magazinesConfig = [
  {
    fileName: "bbst-magazine-vol-02-2025.pdf",
    name: "BBST Student Magazine -- Vol 02 / 2025",
    pages: [
      {
        title: "BBST Magazine -- Volume 02 / 2025",
        subtitle: "Official Student Publication - Faculty of Technological Studies, UWU",
        paragraphs: [
          "Welcome to the second annual volume of BBST Student Magazine.",
          "This issue highlights advances in agricultural automation, climate-smart robotics,",
          "and student entrepreneurial breakthroughs across Uva province.",
          "Explore cutting-edge research, faculty perspectives, and artistic profiles.",
          "Cover Story: Autonomous Agricultural Rovers engineered in Passara Road Campus.",
          "Published by Uva Wellassa University of Sri Lanka, Badulla.",
        ],
      },
      {
        title: "Editorial Board & Table of Contents",
        subtitle: "Volume 02, Issue 01 -- Published September 2025",
        paragraphs: [
          "Page 3 -- Dean's Welcome Address by Prof. H. M. Wickramasinghe",
          "Page 4 -- Autonomous Robotics in Tropical Agriculture by Kasun Perera",
          "Page 5 -- Plant Nanotechnology & Crop Resilience by Dinithi Rajapaksha",
          "Page 6 -- AgroTech Student Innovation Showcase 2025",
          "Page 7 -- Industrial Collaborations & NSF Research Grants",
          "Page 8 -- Reflections & Call for Volume 03 Submissions",
        ],
      },
      {
        title: "Dean's Welcome Message",
        subtitle: "Prof. H. M. Wickramasinghe -- Dean, Faculty of Technological Studies",
        paragraphs: [
          "It is an immense privilege to present the second edition of BBST Magazine.",
          "Our faculty was founded on the vision of producing forward-thinking technologists",
          "who blend scientific rigor with practical industrial problem-solving.",
          "The student contributions in this issue reflect our focus on sustainable dry-zone agriculture,",
          "automated food processing systems, and smart bio-industrial technology.",
          "I congratulate the editorial committee and every student author who has contributed.",
        ],
      },
      {
        title: "Autonomous Robotics in Tropical Agriculture",
        subtitle: "Lead Research Paper -- Kasun Perera & Dr. T. Senanayake",
        paragraphs: [
          "Precision farming in Sri Lanka faces distinctive micro-climatic challenges.",
          "This paper reports on our experimental solar-assisted unmanned rovers designed",
          "to monitor paddy fields in Monaragala and Polonnaruwa.",
          "Using lightweight multispectral sensors and computer vision algorithms, the rover",
          "detects fungal blight 72 hours before visible leaf discoloration occurs.",
          "Field trials demonstrated a 34 percent reduction in chemical pesticide usage.",
        ],
      },
      {
        title: "Plant Nanotechnology & Crop Resilience",
        subtitle: "Applied Biosystems Review -- Dinithi Rajapaksha & Dr. R. Silva",
        paragraphs: [
          "Nanoscale delivery vehicles are transforming conventional agrochemical distribution.",
          "By encapsulating zinc and potassium nanoparticles within biodegradable chitosan shells,",
          "we achieved sustained nutrient release across a 28-day growth cycle.",
          "Maize crops treated with nano-formulations showed 22 percent greater root depth",
          "and significant drought resistance under elevated ambient temperatures.",
        ],
      },
      {
        title: "Student Innovation Spotlight: AgroTech Expo",
        subtitle: "Highlighting Top Prototype Projects from the Class of 2025",
        paragraphs: [
          "1. Automated Cinnamon Peeling Robotic Arm - First Prize Winner",
          "2. IoT Cold-Chain Monitoring System for Perishable Spices",
          "3. Microbial Fuel Cells Utilizing Tea Factory Effluent",
          "4. Drone-Mounted Thermal Imaging for Wild Elephant Herd Early Warning",
          "Each project was evaluated by a joint academic-industry jury from MAS, Hayleys, and SLT.",
        ],
      },
      {
        title: "Department Highlights & Industry Partners",
        subtitle: "Building Pathways between University Research and National Enterprise",
        paragraphs: [
          "During the past year, the Biosystems Technology Department secured over LKR 18M",
          "in competitive research grants from the National Science Foundation (NSF).",
          "Four patent applications were filed by undergraduate research teams.",
          "We express gratitude to our industry mentors who provide student internships,",
          "field trial access, and commercialization pathways.",
        ],
      },
      {
        title: "BBST Magazine -- Back Cover",
        subtitle: "Student Voices for a Brighter Tomorrow",
        paragraphs: [
          "BBST Magazine is published by Uva Wellassa University of Sri Lanka.",
          "Passara Road, Badulla 90000, Sri Lanka.",
          "Digital Platform & Online Reader: http://localhost:3000/magazines",
          "Editorial Correspondence: ceylonnest.org@gmail.com",
          "Call for Papers Volume 03 / 2026 opens August 2025.",
          "Thank you for reading BBST Student Magazine.",
        ],
      },
    ],
  },
  {
    fileName: "bbst-special-edition-climate-2024.pdf",
    name: "BBST Special Edition -- Climate Resilience 2024",
    pages: [
      {
        title: "Climate Resilience & Ecological Frontiers",
        subtitle: "Special Edition 2024 -- Faculty of Technological Studies",
        paragraphs: [
          "Dedicated to climate mitigation strategies in tropical island ecosystems.",
          "Examines micro-irrigation, wetland conservation, and bio-waste conversion.",
          "Authored by student researchers from the Department of Biosystems Technology.",
        ],
      },
      {
        title: "Uva Basin Hydrology & Micro-Watershed Conservation",
        subtitle: "Environmental Engineering Study -- Badulla Valley Catchment",
        paragraphs: [
          "Mapping cloud forest run-off patterns along the Namunukula mountain ridge.",
          "Community-led telemetry stations measuring rainfall intensity and soil erosion.",
          "Policy recommendations for protecting municipal springheads.",
        ],
      },
      {
        title: "Biochar Production from Agricultural Residues",
        subtitle: "Circular Bio-Economy Research -- Organic Soil Amendment",
        paragraphs: [
          "Evaluating pyrolysis efficiency using rice husk and tea pruning waste.",
          "Field experiments showed 40 percent improved moisture retention in sandy loam.",
          "Cost analysis for rural smallholder adoption in Wellawaya.",
        ],
      },
      {
        title: "Student Climate Action Network",
        subtitle: "Initiatives and Green Campus Campaigns at Uva Wellassa University",
        paragraphs: [
          "Tree canopy restoration: 2,500 endemic saplings planted along campus boundaries.",
          "Solar micro-inverter installation powering the environmental science laboratories.",
          "Zero-single-use-plastic initiative across student dining facilities.",
        ],
      },
    ],
  },
  {
    fileName: "bbst-magazine-vol-01-2024.pdf",
    name: "BBST Student Magazine -- Vol 01 / 2024",
    pages: [
      {
        title: "BBST Student Magazine -- Volume 01 / 2024",
        subtitle: "Inaugural Annual Volume -- Celebrating Technology and Innovation",
        paragraphs: [
          "The first formal annual collection of research and student journalism.",
          "Covering IoT, automation, agro-industrial engineering, and biosystems.",
          "Published by the Faculty of Technological Studies, UWU.",
        ],
      },
      {
        title: "Dean's Foreword -- The Dawn of Biosystems Technology",
        subtitle: "Faculty Leadership Perspectives",
        paragraphs: [
          "Reflecting on the evolution of applied technology education in Sri Lanka.",
          "Empowering young minds to bridge traditional farming and digital robotics.",
        ],
      },
      {
        title: "Automated Hydroponics for Urban Centers",
        subtitle: "Undergraduate Engineering Project",
        paragraphs: [
          "Closed-loop nutrient dosing utilizing Arduino microcontrollers.",
          "Yield comparisons between soil-based and nutrient film technique (NFT) systems.",
        ],
      },
      {
        title: "Volume 01 Editorial Team & Colophon",
        subtitle: "Acknowledging the Founding Editors and Faculty Mentors",
        paragraphs: [
          "Chief Student Editor: Kasun Perera | Lead Designer: Dinithi Rajapaksha",
          "Faculty Advisor: Dr. T. Senanayake | Dean: Prof. H. M. Wickramasinghe",
        ],
      },
    ],
  },
  {
    fileName: "bbst-arts-literature-2023.pdf",
    name: "BBST Arts & Literature Anthology 2023",
    pages: [
      {
        title: "Echoes of the Valley -- Arts & Literature 2023",
        subtitle: "Creative Voices from the Technological Community",
        paragraphs: [
          "Bridging science and the humanities: poetry, essays, and campus photography.",
          "An artistic tribute to the natural beauty and academic spirit of Uva.",
        ],
      },
      {
        title: "Poetry from the Mist -- Montane Reflections",
        subtitle: "Student Poetry Collection",
        paragraphs: [
          "Verses written amidst morning fog on the Passara hills.",
          "Themes of discovery, perseverance, and curiosity in the laboratory.",
        ],
      },
      {
        title: "Visual Gallery: Wildlife and Campus Architecture",
        subtitle: "Photographic Portfolio",
        paragraphs: [
          "Capturing endemic bird species around the university reservoir.",
          "Modern concrete architecture nestled in verdant highland greenery.",
        ],
      },
      {
        title: "Concluding Notes from the Editorial Guild",
        subtitle: "Preserving Creative Expression in STEM",
        paragraphs: [
          "Thank you to all contributors who shared their art and stories.",
          "Uva Wellassa University Student Publications Guild 2023.",
        ],
      },
    ],
  },
  {
    fileName: "bbst-inaugural-edition-2023.pdf",
    name: "BBST Inaugural Edition 2023",
    pages: [
      {
        title: "BBST Magazine -- Inaugural Foundation Issue 2023",
        subtitle: "The Founding Chronicle of Biosystems Technology",
        paragraphs: [
          "Marking the official launch of the student editorial platform.",
          "Historical vision, departmental charter, and inaugural student essays.",
        ],
      },
      {
        title: "Vision & Mandate of the Faculty of Technological Studies",
        subtitle: "Charter Statement",
        paragraphs: [
          "Value addition to national resources through innovative education.",
          "Fostering entrepreneurship and ethical leadership in technology.",
        ],
      },
      {
        title: "Looking Ahead to the Future of BBST",
        subtitle: "Milestones and Aspirations",
        paragraphs: [
          "Setting the roadmap for research publications, symposiums, and digital reading.",
          "Uva Wellassa University of Sri Lanka.",
        ],
      },
    ],
  },
];

const outputDir = path.join(process.cwd(), "public", "assets", "magazines");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

for (const mag of magazinesConfig) {
  const filePath = path.join(outputDir, mag.fileName);
  const pdfBuffer = createMultiPagePdf(mag.pages, mag.name);
  fs.writeFileSync(filePath, pdfBuffer);
  console.log(`Generated ${mag.pages.length}-page PDF: ${mag.fileName} (${pdfBuffer.length} bytes)`);
}

console.log("\nAll 5 authentic magazine PDFs generated successfully in public/assets/magazines/!");
