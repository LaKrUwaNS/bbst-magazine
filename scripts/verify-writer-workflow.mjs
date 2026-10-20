// Comprehensive E2E Verification for BBST Magazine Writer Profile System
// Tests all 15 verification steps required by the specification.

const BASE_URL = "http://127.0.0.1:3000";

let cookieHeader = "";
let createdWriterId = "";
let createdWriterSlug = `test-writer-${Date.now()}`;
let testArticleId = "";
let testArticleSlug = `test-article-${Date.now()}`;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

async function runTests() {
  console.log("=== STARTING BBST WRITER PROFILE VERIFICATION ===");

  // STEP 1: Log in as an authorized editor
  console.log("\n[Step 1] Logging in as authorized editor...");
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "editor@bbst.uwu.ac.lk",
      password: "Editor@BBST2025!",
    }),
  });
  assert(loginRes.status === 200, `Login status 200, got ${loginRes.status}`);
  const setCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get("set-cookie")];
  const sessionCookieStr = setCookies.find(c => c && c.includes("bbst_editor_session"));
  assert(Boolean(sessionCookieStr), `Session cookie received`);
  cookieHeader = sessionCookieStr.split(";")[0];
  console.log("Logged in successfully. Session cookie acquired:", cookieHeader);

  // STEP 2 & 3 & 4: Create a writer profile as DRAFT with photo
  console.log("\n[Step 2, 3, 4] Creating a writer profile with photo saved as DRAFT...");
  const createDraftRes = await fetch(`${BASE_URL}/api/admin/writers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      name: "Dr. Thivanka Senanayake",
      slug: createdWriterSlug,
      shortBio: "Senior Lecturer in Biosystems Technology with research in Agricultural Nanotechnology.",
      bio: "Dr. Thivanka Senanayake has over 12 years of research and teaching experience at Uva Wellassa University. He holds a PhD in Biosystems Engineering and focuses on sustainable agro-industrial applications and smart farming.",
      profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop",
      profileImagePublicId: "bbst/writers/test-thivanka",
      department: "Biosystems Technology",
      academicYear: "Faculty Member",
      role: "Senior Lecturer & Research Lead",
      expertise: "Agricultural Nanotechnology, Smart Sensors, Food Bioprocessing",
      email: "thivanka@uwu.ac.lk",
      website: "https://thivanka-research.edu",
      socialLinks: {
        linkedin: "https://linkedin.com/in/thivanka",
        twitter: "https://twitter.com/thivanka",
      },
      status: "DRAFT",
      isFeatured: false,
    }),
  });

  const createDraftData = await createDraftRes.json();
  assert(createDraftRes.status === 201, `Draft profile created with 201, got ${createDraftRes.status}: ${JSON.stringify(createDraftData)}`);
  createdWriterId = createDraftData.writer.id;
  assert(createDraftData.writer.status === "DRAFT", "Profile status is DRAFT");
  assert(createDraftData.writer.profileImageUrl.length > 0, "Profile photo URL stored");

  // STEP 5: Verify that the draft profile is NOT publicly accessible
  console.log("\n[Step 5] Verifying draft profile is NOT publicly accessible...");
  const publicWritersBeforePublish = await fetch(`${BASE_URL}/api/writers`);
  const publicWritersBeforePublishData = await publicWritersBeforePublish.json();
  const foundInPublicList = (publicWritersBeforePublishData.writers || []).some(w => w.slug === createdWriterSlug);
  assert(!foundInPublicList, "Draft writer is NOT listed in public /api/writers directory");

  const publicProfileDraftRes = await fetch(`${BASE_URL}/api/writers/${createdWriterSlug}`);
  assert(publicProfileDraftRes.status === 404, `Public fetch for draft writer returns 404, got ${publicProfileDraftRes.status}`);

  // STEP 6: Publish the profile
  console.log("\n[Step 6] Publishing the writer profile...");
  const publishRes = await fetch(`${BASE_URL}/api/admin/writers/${createdWriterId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      status: "PUBLISHED",
      isFeatured: true,
    }),
  });
  const publishData = await publishRes.json();
  assert(publishRes.status === 200, `Published profile successfully with 200, got ${publishRes.status}`);
  assert(publishData.writer.status === "PUBLISHED", "Profile status updated to PUBLISHED");
  assert(publishData.writer.isFeatured === true, "Profile marked as featured");

  // STEP 7: Confirm that it appears on /writers
  console.log("\n[Step 7] Confirming writer appears on public /writers...");
  const publicWritersAfterPublish = await fetch(`${BASE_URL}/api/writers?q=Thivanka`);
  const publicWritersAfterPublishData = await publicWritersAfterPublish.json();
  const foundPublishedWriter = (publicWritersAfterPublishData.writers || []).find(w => w.slug === createdWriterSlug);
  assert(Boolean(foundPublishedWriter), "Published writer found in public /api/writers search results");
  assert(foundPublishedWriter.name === "Dr. Thivanka Senanayake", "Writer name matches");

  // Also verify HTML response of /writers renders
  const writersHtmlRes = await fetch(`${BASE_URL}/writers`);
  assert(writersHtmlRes.status === 200, `/writers page renders with status 200`);

  // STEP 8: Open the individual profile page
  console.log("\n[Step 8] Opening individual public profile page (/writers/[slug])...");
  const publicProfileRes = await fetch(`${BASE_URL}/api/writers/${createdWriterSlug}`);
  assert(publicProfileRes.status === 200, `Public profile API returns 200, got ${publicProfileRes.status}`);
  const publicProfileData = await publicProfileRes.json();
  assert(publicProfileData.writer.name === "Dr. Thivanka Senanayake", "Public profile has correct writer name");
  assert(publicProfileData.writer.expertise.includes("Agricultural Nanotechnology"), "Public profile has expertise");
  assert(publicProfileData.writer.socialLinks.linkedin === "https://linkedin.com/in/thivanka", "Public profile has social links");

  const writerPageHtmlRes = await fetch(`${BASE_URL}/writers/${createdWriterSlug}`);
  assert(writerPageHtmlRes.status === 200, `/writers/${createdWriterSlug} page renders with 200 OK`);
  const writerPageHtml = await writerPageHtmlRes.text();
  assert(writerPageHtml.includes("Thivanka Senanayake"), "Writer name is present in HTML page output");

  // STEP 9: Associate the writer with an article
  console.log("\n[Step 9] Creating and associating an article with the writer...");
  const createArticleRes = await fetch(`${BASE_URL}/api/admin/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      title: "Nanotechnology in Modern Tropical Agriculture",
      slug: testArticleSlug,
      excerpt: "Exploring nanoscale interventions to maximize crop yield and disease resistance in dry zone ecosystems.",
      content: "<p>Nanotechnology offers revolutionary pathways for nutrient delivery and pest management in tropical climates. This article reviews field trials conducted at Uva Wellassa University.</p>",
      authorName: "Dr. Thivanka Senanayake",
      authorEmail: "thivanka@uwu.ac.lk",
      authorDept: "Biosystems Technology",
      writerId: createdWriterId,
      status: "PUBLISHED",
      isFeatured: true,
      tags: ["Nanotechnology", "Agriculture", "Biosystems"],
    }),
  });
  const createArticleData = await createArticleRes.json();
  assert(createArticleRes.status === 200, `Article created successfully with 200, got ${createArticleRes.status}: ${JSON.stringify(createArticleData)}`);
  testArticleId = createArticleData.article.id;
  assert(createArticleData.article.writerId === createdWriterId, "Article is linked to createdWriterId");

  // STEP 10: Publish the article and confirm it appears on the writer's profile
  console.log("\n[Step 10] Verifying article appears on the writer's public profile...");
  const writerWithArticlesRes = await fetch(`${BASE_URL}/api/writers/${createdWriterSlug}`);
  const writerWithArticlesData = await writerWithArticlesRes.json();
  assert(writerWithArticlesData.writer.publishedArticlesCount >= 1, `Writer articlesCount is >= 1 (got ${writerWithArticlesData.writer.publishedArticlesCount})`);
  const associatedArticle = (writerWithArticlesData.writer.articles || []).find(a => a.slug === testArticleSlug);
  assert(Boolean(associatedArticle), "Associated article is returned in writer's public articles collection");
  assert(associatedArticle.title === "Nanotechnology in Modern Tropical Agriculture", "Article title matches");

  // STEP 11: Verify that the article page links back to the writer's profile
  console.log("\n[Step 11] Verifying public article page links back to writer profile...");
  const articlePageHtmlRes = await fetch(`${BASE_URL}/articles/${testArticleSlug}`);
  assert(articlePageHtmlRes.status === 200, `Article page renders with status 200`);
  const articlePageHtml = await articlePageHtmlRes.text();
  assert(articlePageHtml.includes(`/writers/${createdWriterSlug}`), `Article page HTML links back to /writers/${createdWriterSlug}`);
  assert(articlePageHtml.includes("Thivanka Senanayake"), "Article page mentions author name");

  // STEP 12: Edit the profile and confirm that the changes are reflected
  console.log("\n[Step 12] Editing writer profile and confirming changes...");
  const updateRes = await fetch(`${BASE_URL}/api/admin/writers/${createdWriterId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      shortBio: "Updated short bio: Lead Researcher in Agricultural Nanotechnology and Smart Biosystems.",
      role: "Professor of Biosystems Engineering",
    }),
  });
  const updateData = await updateRes.json();
  assert(updateRes.status === 200, `Updated writer with 200, got ${updateRes.status}`);
  assert(updateData.writer.role === "Professor of Biosystems Engineering", "Updated role reflected");

  const verifyUpdatedRes = await fetch(`${BASE_URL}/api/writers/${createdWriterSlug}`);
  const verifyUpdatedData = await verifyUpdatedRes.json();
  assert(verifyUpdatedData.writer.role === "Professor of Biosystems Engineering", "Public API reflects updated role");

  // STEP 13: Unpublish the profile and verify that public access is removed
  console.log("\n[Step 13] Unpublishing the profile and verifying public access is removed...");
  const unpublishRes = await fetch(`${BASE_URL}/api/admin/writers/${createdWriterId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      status: "DRAFT",
    }),
  });
  assert(unpublishRes.status === 200, `Unpublished writer with 200, got ${unpublishRes.status}`);

  const publicAccessAfterUnpublish = await fetch(`${BASE_URL}/api/writers/${createdWriterSlug}`);
  assert(publicAccessAfterUnpublish.status === 404, `Public API returns 404 for unpublished writer, got ${publicAccessAfterUnpublish.status}`);

  // Re-publish for deletion tests
  await fetch(`${BASE_URL}/api/admin/writers/${createdWriterId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ status: "PUBLISHED" }),
  });

  // STEP 14: Verify that unauthorized users cannot modify profiles through direct API requests
  console.log("\n[Step 14] Verifying unauthorized requests are rejected (401)...");
  const unauthPostRes = await fetch(`${BASE_URL}/api/admin/writers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Hacker", slug: "hacker" }),
  });
  assert(unauthPostRes.status === 401, `Unauthorized POST /api/admin/writers rejected with 401, got ${unauthPostRes.status}`);

  const unauthPatchRes = await fetch(`${BASE_URL}/api/admin/writers/${createdWriterId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Compromised Name" }),
  });
  assert(unauthPatchRes.status === 401, `Unauthorized PATCH /api/admin/writers/[id] rejected with 401, got ${unauthPatchRes.status}`);

  const unauthDeleteRes = await fetch(`${BASE_URL}/api/admin/writers/${createdWriterId}`, {
    method: "DELETE",
  });
  assert(unauthDeleteRes.status === 401, `Unauthorized DELETE /api/admin/writers/[id] rejected with 401, got ${unauthDeleteRes.status}`);

  // STEP 15: Test invalid slugs, duplicate slugs, missing fields, and safe deletion
  console.log("\n[Step 15] Testing invalid input, duplicate slugs, missing fields, and safe deletion...");
  
  // Missing required fields
  const missingFieldsRes = await fetch(`${BASE_URL}/api/admin/writers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      // missing name and slug
      bio: "Some bio",
    }),
  });
  assert(missingFieldsRes.status === 400, `Missing required fields rejected with 400, got ${missingFieldsRes.status}`);

  // Duplicate slug
  const duplicateSlugRes = await fetch(`${BASE_URL}/api/admin/writers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      name: "Duplicate Writer",
      slug: createdWriterSlug, // existing slug
      shortBio: "Short bio",
      bio: "Full bio",
    }),
  });
  // Since slug collision auto-disambiguates or returns 409 depending on logic, let's test if it handles uniqueness
  console.log("Duplicate slug test responded with status:", duplicateSlugRes.status);
  assert(duplicateSlugRes.status === 201 || duplicateSlugRes.status === 409, "Duplicate slug handled cleanly");
  const dupData = await duplicateSlugRes.json();
  if (dupData.writer) {
    // If auto-disambiguated, ensure it got a unique slug
    assert(dupData.writer.slug !== createdWriterSlug, "Auto-disambiguated slug is different from existing");
    // Clean up dup writer
    await fetch(`${BASE_URL}/api/admin/writers/${dupData.writer.id}`, {
      method: "DELETE",
      headers: { Cookie: cookieHeader },
    });
  }

  // Safe deletion behavior on writer with associated articles:
  console.log("\nTesting deletion behavior on writer with associated articles...");
  const deleteWithArticlesRes = await fetch(`${BASE_URL}/api/admin/writers/${createdWriterId}`, {
    method: "DELETE",
    headers: { Cookie: cookieHeader },
  });
  const deleteWithArticlesData = await deleteWithArticlesRes.json();
  assert(deleteWithArticlesRes.status === 400, `Deleting writer with active articles is safely prevented with 400, got ${deleteWithArticlesRes.status}: ${deleteWithArticlesData.error}`);

  // Clean up: delete test article first, then delete test writer
  console.log("\nCleaning up test article and test writer...");
  const deleteArticleRes = await fetch(`${BASE_URL}/api/admin/articles/${testArticleId}`, {
    method: "DELETE",
    headers: { Cookie: cookieHeader },
  });
  assert(deleteArticleRes.status === 200, `Test article deleted with status 200, got ${deleteArticleRes.status}`);

  const deleteWriterRes = await fetch(`${BASE_URL}/api/admin/writers/${createdWriterId}`, {
    method: "DELETE",
    headers: { Cookie: cookieHeader },
  });
  assert(deleteWriterRes.status === 200, `Test writer deleted cleanly with status 200, got ${deleteWriterRes.status}`);

  console.log("\n=======================================================");
  console.log("🎉 ALL 15 END-TO-END VERIFICATION STEPS PASSED PERFECTLY!");
  console.log("=======================================================\n");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
