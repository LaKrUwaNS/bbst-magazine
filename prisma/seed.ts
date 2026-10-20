import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { BBST_MAGAZINES } from "../src/data/magazines.data";
import { MOCK_CATEGORIES, MOCK_ARTICLES } from "../src/data/articles.mock";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding BBST Magazine database...");

  // 1. Seed Categories
  console.log("Seeding categories...");
  for (const cat of MOCK_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      },
    });
  }

  // 2. Seed Initial Admin User
  console.log("Seeding administrator user...");
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@bbst.uwu.ac.lk";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      id: "admin-user-01",
      name: "BBST Chief Editor",
      email: adminEmail,
      emailVerified: true,
      image: "/images/avatar1.jpg",
      role: "ADMIN",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 3. Seed Authors & Articles from Mock Data
  console.log("Seeding authors and articles...");
  for (const art of MOCK_ARTICLES) {
    // Upsert Author
    const authorEmail = art.author.email || `${art.author.id}@bbst.uwu.ac.lk`;
    await prisma.user.upsert({
      where: { email: authorEmail },
      update: {
        name: art.author.name,
        image: art.author.avatar,
      },
      create: {
        id: art.author.id,
        name: art.author.name,
        email: authorEmail,
        emailVerified: true,
        image: art.author.avatar,
        role: "EDITOR",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Content compilation from sections
    const contentHtml = art.sections
      .map((s) => `<h3>${s.heading}</h3>${s.content.map((p) => `<p>${p}</p>`).join("")}`)
      .join("");

    // Find category ID
    const dbCategory = await prisma.category.findUnique({
      where: { slug: art.category.slug },
    });

    // Upsert Article
    await prisma.article.upsert({
      where: { slug: art.slug },
      update: {
        title: art.title,
        excerpt: art.excerpt,
        content: contentHtml,
        coverImage: art.coverImage,
        status: art.status,
        authorId: art.author.id,
        categoryId: dbCategory?.id || null,
      },
      create: {
        id: art.id,
        title: art.title,
        slug: art.slug,
        excerpt: art.excerpt,
        content: contentHtml,
        coverImage: art.coverImage,
        status: art.status,
        authorId: art.author.id,
        categoryId: dbCategory?.id || null,
        createdAt: new Date(art.publishedAt),
      },
    });
  }

  // 4. Seed Magazine Issues
  console.log("Seeding magazine issues...");
  for (const mag of BBST_MAGAZINES) {
    await prisma.magazineIssue.upsert({
      where: { slug: mag.slug },
      update: {
        title: mag.title,
        description: mag.description,
        coverImage: mag.coverImage,
        pdfAsset: mag.pdfAsset,
        publicationDate: new Date(mag.publicationDate),
        status: mag.status,
      },
      create: {
        id: mag.id,
        title: mag.title,
        slug: mag.slug,
        description: mag.description,
        coverImage: mag.coverImage,
        pdfAsset: mag.pdfAsset,
        publicationDate: new Date(mag.publicationDate),
        status: mag.status,
      },
    });
  }

  console.log("Database seeded successfully with categories, articles, authors, and magazines!");
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
