import { prisma } from "../src/lib/prisma";
import { magazineRepository } from "../src/lib/magazines/magazine-repository";
import { categoryRepository } from "../src/lib/categories/category-repository";

const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

interface TestResult {
  name: string;
  status: "PASS" | "FAIL";
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function recordPass(name: string, details?: string) {
  results.push({ name, status: "PASS", details });
  console.log(`[PASS] ${name}${details ? ` - ${details}` : ""}`);
}

function recordFail(name: string, error: unknown) {
  const errMsg = error instanceof Error ? error.message : String(error);
  results.push({ name, status: "FAIL", error: errMsg });
  console.error(`[FAIL] ${name} - ${errMsg}`);
}

async function runTests() {
  console.log("==================================================");
  console.log("  BBST Magazine End-to-End System Audit Tests     ");
  console.log("==================================================\n");

  // 1. PUBLIC CATEGORIES API & REPOSITORY
  try {
    const res = await fetch(`${BASE_URL}/api/categories`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.categories)) {
      throw new Error("Invalid response format from /api/categories");
    }
    const repoCategories = await categoryRepository.getCategories();
    recordPass(
      "Public Categories API (/api/categories)",
      `Loaded ${json.categories.length} DB categories (Repository returned ${repoCategories.length})`
    );
  } catch (err) {
    recordFail("Public Categories API (/api/categories)", err);
  }

  // 2. SUBMISSION RATE LIMITING & VALIDATION
  const testIp = `10.99.1.${Math.floor(Math.random() * 200) + 1}`;
  try {
    const invalidRes = await fetch(`${BASE_URL}/api/articles/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": testIp,
      },
      body: JSON.stringify({ title: "Short" }),
    });
    if (invalidRes.status !== 400) {
      throw new Error(`Expected 400 for invalid submission, got ${invalidRes.status}`);
    }
    recordPass("Article Submission Input Validation", "Rejected invalid payload with 400");
  } catch (err) {
    recordFail("Article Submission Input Validation", err);
  }

  // 3. COMPLETE SUBMISSION END-TO-END VIA API
  let testSubmissionRef = "";
  try {
    const validPayload = {
      title: "Automated Verification Manuscript on Agricultural Innovation",
      excerpt: "Demonstrating automated IoT soil probes and AI yield forecasting.",
      content:
        "<p>This is a comprehensive automated audit test manuscript demonstrating end-to-end editorial submission, database persistence, reference generation, and author attribution verification.</p>",
      authorName: "Verification Student",
      authorEmail: "verify-student@uwu.ac.lk",
      authorDept: "Bio-Systems Technology",
      agreeTerms: true,
    };

    const submitRes = await fetch(`${BASE_URL}/api/articles/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": testIp,
      },
      body: JSON.stringify(validPayload),
    });

    const submitJson = await submitRes.json();
    if (!submitRes.ok || !submitJson.submissionRef) {
      throw new Error(`Submission failed: ${submitJson.error || JSON.stringify(submitJson)}`);
    }

    testSubmissionRef = submitJson.submissionRef;
    recordPass(
      "Article Submission Flow",
      `Created submission with reference ${testSubmissionRef} and articleId ${submitJson.articleId}`
    );

    // Verify submission exists in PostgreSQL with SUBMITTED status
    const inDb = await prisma.article.findUnique({
      where: { submissionRef: testSubmissionRef },
    });
    if (!inDb || inDb.status !== "SUBMITTED") {
      throw new Error("Submitted article was not persisted in DB with SUBMITTED status");
    }
    recordPass("Database Submission Persistence", `DB record confirmed for ref ${testSubmissionRef}`);

    // Track submission via /api/articles/track
    const trackRes = await fetch(
      `${BASE_URL}/api/articles/track?ref=${encodeURIComponent(testSubmissionRef)}`
    );
    const trackJson = await trackRes.json();
    if (!trackRes.ok || trackJson.submission?.ref !== testSubmissionRef) {
      throw new Error(`Failed to track submission ref ${testSubmissionRef}`);
    }
    recordPass("Submission Tracking Endpoint", `Tracked submission status: ${trackJson.submission.status}`);

    // Clean up test submission
    await prisma.article.delete({ where: { submissionRef: testSubmissionRef } });
    recordPass("Submission Test Cleanup", "Removed test submission record");
  } catch (err) {
    recordFail("Article Submission Flow", err);
    if (testSubmissionRef) {
      await prisma.article.delete({ where: { submissionRef: testSubmissionRef } }).catch(() => null);
    }
  }

  // 4. ADMIN ROUTE AUTHORIZATION GUARDS
  try {
    const [artAdminRes, magAdminRes, writAdminRes, upAdminRes] = await Promise.all([
      fetch(`${BASE_URL}/api/admin/articles`),
      fetch(`${BASE_URL}/api/admin/magazines`),
      fetch(`${BASE_URL}/api/admin/writers`),
      fetch(`${BASE_URL}/api/admin/upload`, { method: "POST" }),
    ]);

    if (artAdminRes.status !== 401) throw new Error(`Articles API returned ${artAdminRes.status} instead of 401`);
    if (magAdminRes.status !== 401) throw new Error(`Magazines API returned ${magAdminRes.status} instead of 401`);
    if (writAdminRes.status !== 401) throw new Error(`Writers API returned ${writAdminRes.status} instead of 401`);
    if (upAdminRes.status !== 401) throw new Error(`Upload API returned ${upAdminRes.status} instead of 401`);

    recordPass("Admin Protected Endpoints Guard", "All admin APIs strictly return 401 Unauthorized for unauthenticated clients");
  } catch (err) {
    recordFail("Admin Protected Endpoints Guard", err);
  }

  // 5. MAGAZINE REPOSITORY CONSISTENCY & ATTRIBUTES
  try {
    const magazines = await magazineRepository.getMagazines();
    if (magazines.length === 0) {
      throw new Error("MagazineRepository returned 0 magazines");
    }

    const featured = await magazineRepository.getFeaturedMagazine();
    if (!featured) {
      throw new Error("MagazineRepository failed to return a featured or latest magazine");
    }

    recordPass(
      "Magazine Repository & Metadata",
      `Loaded ${magazines.length} issues. Featured: "${featured.title}" (${featured.edition})`
    );
  } catch (err) {
    recordFail("Magazine Repository & Metadata", err);
  }

  // 6. WRITER PROFILE AND ARTICLE ATTRIBUTION INTEGRATION
  let testWriterId = "";
  let testArticleId = "";
  try {
    // Create test writer profile
    const testWriter = await prisma.writerProfile.create({
      data: {
        name: "Dr. QA Specialist",
        slug: "dr-qa-specialist-test",
        bio: "Senior researcher in agricultural robotics and sensor networks.",
        department: "Faculty of Applied Sciences",
        role: "Research Fellow",
        status: "PUBLISHED",
      },
    });
    testWriterId = testWriter.id;

    // Create published article linked to test writer with a cover image
    const testArticle = await prisma.article.create({
      data: {
        title: "QA Test Published Article on Autonomous Systems",
        slug: "qa-test-published-article-systems",
        excerpt: "Autonomous monitoring of crop stresses in rural Sri Lanka.",
        content: "<p>Comprehensive field testing of multispectral drone mapping over tea plantations.</p>",
        coverImage: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        coverImagePublicId: "bbst/sample_drone_cover",
        authorName: testWriter.name,
        authorDept: testWriter.department,
        writerId: testWriter.id,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
    testArticleId = testArticle.id;

    // Verify writer profile includes the published article
    const writerWithArticles = await prisma.writerProfile.findUnique({
      where: { id: testWriter.id },
      include: {
        articles: {
          where: { status: { in: ["PUBLISHED", "published"] } },
        },
      },
    });

    if (!writerWithArticles || writerWithArticles.articles.length !== 1) {
      throw new Error("Writer profile did not include linked published article");
    }

    recordPass(
      "Writer & Article Linkage",
      `Writer "${testWriter.name}" correctly linked to article "${testArticle.title}" with cover image`
    );

    // Verify deleting writer profile preserves article author metadata (onDelete: SetNull)
    await prisma.writerProfile.delete({ where: { id: testWriter.id } });
    testWriterId = "";

    const articleAfterWriterDelete = await prisma.article.findUnique({
      where: { id: testArticle.id },
    });

    if (!articleAfterWriterDelete) {
      throw new Error("Article was unexpectedly deleted when writer was deleted!");
    }

    if (articleAfterWriterDelete.writerId !== null) {
      throw new Error("Article.writerId was not set to null upon writer deletion");
    }

    if (articleAfterWriterDelete.authorName !== "Dr. QA Specialist") {
      throw new Error("Article authorName was lost when writer was deleted!");
    }

    recordPass(
      "Authorship Attribution Preservation",
      "Deleting a writer profile set article.writerId to null while completely preserving authorName and metadata"
    );

    // Clean up test article
    await prisma.article.delete({ where: { id: testArticle.id } });
    testArticleId = "";
    recordPass("Writer/Article Test Cleanup", "All test entities cleaned up cleanly");
  } catch (err) {
    recordFail("Writer Profile Integration", err);
  } finally {
    if (testArticleId) {
      await prisma.article.delete({ where: { id: testArticleId } }).catch(() => null);
    }
    if (testWriterId) {
      await prisma.writerProfile.delete({ where: { id: testWriterId } }).catch(() => null);
    }
  }

  // SUMMARY
  console.log("\n==================================================");
  console.log("               TEST SUITE SUMMARY                 ");
  console.log("==================================================");
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  console.log(`Total Tests : ${results.length}`);
  console.log(`Passed      : ${passed}`);
  console.log(`Failed      : ${failed}`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY!");
  }
}

runTests()
  .catch((e) => {
    console.error("Unhandled error running tests:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
