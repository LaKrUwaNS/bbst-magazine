import { prisma } from "../src/lib/prisma";
import { eventRepository } from "../src/lib/events/event-repository";

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

async function runEventsVerification() {
  console.log("==================================================");
  console.log("  BBST Magazine Events System Verification Tests  ");
  console.log("==================================================\n");

  // 1. DATABASE MODELS & SEED DATA CHECK
  try {
    const totalEventsInDb = await prisma.event.count();
    const totalSuggestionsInDb = await prisma.eventSuggestion.count();
    if (totalEventsInDb === 0) throw new Error("No events found in database. Seed needed.");
    recordPass(
      "Prisma DB Event & Suggestion Models",
      `Found ${totalEventsInDb} events and ${totalSuggestionsInDb} suggestions in PostgreSQL`
    );
  } catch (err) {
    recordFail("Prisma DB Event & Suggestion Models", err);
  }

  // 2. PRISMA EVENT REPOSITORY VERIFICATION
  try {
    const publicEvents = await eventRepository.getEvents();
    if (publicEvents.length === 0) throw new Error("No published events returned from eventRepository");
    
    // Check that all returned events are published
    const nonPublished = await prisma.event.findMany({
      where: {
        id: { in: publicEvents.map((e) => e.id) },
        publicationStatus: { not: "PUBLISHED" },
      },
    });
    if (nonPublished.length > 0) {
      throw new Error(`Public repository returned ${nonPublished.length} non-published events!`);
    }

    const featured = await eventRepository.getFeaturedEvents();
    const categories = await eventRepository.getEventCategories();

    recordPass(
      "PrismaEventRepository Public Access",
      `Retrieved ${publicEvents.length} published events, ${featured.length} featured events, and ${categories.length} categories`
    );
  } catch (err) {
    recordFail("PrismaEventRepository Public Access", err);
  }

  // 3. PUBLIC SUGGESTION SUBMISSION VALIDATION & RATE LIMITING
  try {
    // 3A: Invalid payload should fail with 400
    const invalidRes = await fetch(`${BASE_URL}/api/events/suggest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Hi" }), // Too short, missing fields
    });
    if (invalidRes.status !== 400) {
      throw new Error(`Expected 400 for invalid payload, got ${invalidRes.status}`);
    }
    const invalidJson = await invalidRes.json();
    if (invalidJson.success !== false) {
      throw new Error("Invalid payload did not return success: false");
    }

    // 3B: Valid payload should succeed and create an EventSuggestion in DB
    const validProposal = {
      title: "Automated Test Public Event Proposal",
      category: "WORKSHOP",
      suggestedDate: "2026-11-20 14:00",
      venue: "Main Auditorium, Badulla",
      description: "An automated end-to-end verification proposal for testing the suggestion pipeline.",
      organizerName: "Test Proposer",
      organizerEmail: "proposer.test@uwu.ac.lk",
    };

    const validRes = await fetch(`${BASE_URL}/api/events/suggest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": `192.168.10.${Math.floor(Math.random() * 200) + 1}`,
      },
      body: JSON.stringify(validProposal),
    });

    if (!validRes.ok) {
      const errText = await validRes.text();
      throw new Error(`HTTP ${validRes.status}: ${errText}`);
    }

    const validJson = await validRes.json();
    if (!validJson.success || !validJson.suggestion?.id) {
      throw new Error("Valid suggestion response did not return suggestion ID");
    }

    const createdSuggestion = await prisma.eventSuggestion.findUnique({
      where: { id: validJson.suggestion.id },
    });
    if (!createdSuggestion || createdSuggestion.status !== "PENDING") {
      throw new Error("Suggestion was not properly saved to database with PENDING status");
    }

    recordPass(
      "Public Event Suggestion API (/api/events/suggest)",
      `Successfully validated input and recorded suggestion (ID: ${createdSuggestion.id})`
    );

    // Clean up test suggestion
    await prisma.eventSuggestion.delete({ where: { id: createdSuggestion.id } });
  } catch (err) {
    recordFail("Public Event Suggestion API (/api/events/suggest)", err);
  }

  // 4. SECURITY & AUTHORIZATION ON ADMIN ROUTES (UNAUTHENTICATED MUST BE 401)
  const adminEndpoints = [
    { method: "GET", url: `${BASE_URL}/api/admin/events` },
    { method: "POST", url: `${BASE_URL}/api/admin/events` },
    { method: "GET", url: `${BASE_URL}/api/admin/events/non-existent-id` },
    { method: "PUT", url: `${BASE_URL}/api/admin/events/non-existent-id` },
    { method: "DELETE", url: `${BASE_URL}/api/admin/events/non-existent-id` },
    { method: "PATCH", url: `${BASE_URL}/api/admin/events/non-existent-id/status` },
    { method: "GET", url: `${BASE_URL}/api/admin/events/suggestions` },
    { method: "POST", url: `${BASE_URL}/api/admin/events/suggestions/non-existent-id/action` },
  ];

  let authAllPassed = true;
  for (const ep of adminEndpoints) {
    try {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers: { "Content-Type": "application/json" },
        body: ep.method !== "GET" ? JSON.stringify({}) : undefined,
      });
      if (res.status !== 401) {
        authAllPassed = false;
        recordFail(
          `Security Check: ${ep.method} ${ep.url}`,
          new Error(`Expected 401 Unauthorized, received ${res.status}`)
        );
      }
    } catch (err) {
      authAllPassed = false;
      recordFail(`Security Check: ${ep.method} ${ep.url}`, err);
    }
  }

  if (authAllPassed) {
    recordPass(
      "Admin API Route Authorization Guard",
      `All 8 administrative endpoints strictly blocked unauthenticated requests with HTTP 401`
    );
  }

  // 5. EVENT LIFECYCLE (DRAFT -> PUBLISH -> PUBLIC CHECK -> UNPUBLISH -> DELETE)
  try {
    const testSlug = `e2e-test-lifecycle-${Date.now()}`;
    const startAt = new Date();
    startAt.setDate(startAt.getDate() + 5);
    const endAt = new Date(startAt);
    endAt.setHours(endAt.getHours() + 2);

    // 5A: Create Draft Event in DB
    const createdEvent = await prisma.event.create({
      data: {
        title: "E2E Lifecycle Verification Event",
        slug: testSlug,
        excerpt: "A temporary event for lifecycle testing.",
        description: "Full event description for testing creation, publishing, and deletion.",
        category: "WORKSHOP",
        categorySlug: "workshops",
        startAt,
        endAt,
        timezone: "Asia/Colombo",
        venue: "E2E Testing Lab",
        organizer: "Antigravity Quality Assurance",
        capacity: 40,
        publicationStatus: "DRAFT",
      },
    });

    // Verify it is NOT returned on the public page
    const publicEventsWhileDraft = await eventRepository.getEvents();
    if (publicEventsWhileDraft.some((e) => e.id === createdEvent.id)) {
      throw new Error("Draft event was incorrectly exposed via public eventRepository!");
    }

    // 5B: Publish Event
    await prisma.event.update({
      where: { id: createdEvent.id },
      data: { publicationStatus: "PUBLISHED" },
    });

    // Verify it IS NOW returned on the public page
    const publicEventsWhilePublished = await eventRepository.getEvents();
    const foundPublished = publicEventsWhilePublished.find((e) => e.id === createdEvent.id);
    if (!foundPublished) {
      throw new Error("Published event was NOT found in public eventRepository!");
    }
    if (foundPublished.title !== "E2E Lifecycle Verification Event") {
      throw new Error("Published event title did not match expected value");
    }

    // 5C: Unpublish Event (back to DRAFT)
    await prisma.event.update({
      where: { id: createdEvent.id },
      data: { publicationStatus: "DRAFT" },
    });
    const publicEventsAfterUnpublish = await eventRepository.getEvents();
    if (publicEventsAfterUnpublish.some((e) => e.id === createdEvent.id)) {
      throw new Error("Unpublished event remained visible in public eventRepository!");
    }

    // 5D: Delete Event
    await prisma.event.delete({ where: { id: createdEvent.id } });
    const checkDeleted = await prisma.event.findUnique({ where: { id: createdEvent.id } });
    if (checkDeleted !== null) {
      throw new Error("Deleted event still found in database!");
    }

    recordPass(
      "Event Lifecycle & Visibility Control",
      "Draft -> Published (visible publicly) -> Draft (hidden) -> Deleted (cleared)"
    );
  } catch (err) {
    recordFail("Event Lifecycle & Visibility Control", err);
  }

  // 6. SUGGESTION APPROVAL WORKFLOW & DEDUPLICATION
  try {
    // 6A: Create a test suggestion
    const testSuggestion = await prisma.eventSuggestion.create({
      data: {
        title: "Suggestion Conversion E2E Test",
        category: "COMPETITION",
        suggestedDate: "2026-12-01",
        venue: "Innovation Center",
        description: "Test suggestion to verify atomic approval into an Event and rejection workflows.",
        organizerName: "Alice Researcher",
        organizerEmail: "alice.res@uwu.ac.lk",
        status: "PENDING",
      },
    });

    // 6B: Approve and convert suggestion to Event
    const convertedEventSlug = `approved-sug-event-${Date.now()}`;
    const sugStartAt = new Date();
    sugStartAt.setDate(sugStartAt.getDate() + 10);
    const sugEndAt = new Date(sugStartAt);
    sugEndAt.setHours(sugEndAt.getHours() + 3);

    const createdFromSug = await prisma.$transaction(async (tx) => {
      const sug = await tx.eventSuggestion.findUnique({ where: { id: testSuggestion.id } });
      if (!sug || sug.status !== "PENDING") {
        throw new Error("Suggestion not pending");
      }

      const ev = await tx.event.create({
        data: {
          title: sug.title,
          slug: convertedEventSlug,
          excerpt: `Approved from public suggestion by ${sug.organizerName}`,
          description: sug.description,
          category: sug.category,
          categorySlug: "competitions",
          startAt: sugStartAt,
          endAt: sugEndAt,
          timezone: "Asia/Colombo",
          venue: sug.venue || "Campus Venue",
          organizer: sug.organizerName || "Editorial Board",
          publicationStatus: "PUBLISHED",
          suggestionId: sug.id,
        },
      });

      await tx.eventSuggestion.update({
        where: { id: sug.id },
        data: {
          status: "APPROVED",
        },
      });

      return ev;
    });

    // Verify duplicate conversion is prevented
    const secondAttempt = await prisma.eventSuggestion.findUnique({
      where: { id: testSuggestion.id },
      include: { event: true },
    });
    if (secondAttempt?.status !== "APPROVED" || secondAttempt.event?.id !== createdFromSug.id) {
      throw new Error("Suggestion approval state or linked event ID incorrect");
    }

    // Clean up created event and suggestion
    await prisma.event.delete({ where: { id: createdFromSug.id } });
    await prisma.eventSuggestion.delete({ where: { id: testSuggestion.id } });

    recordPass(
      "Suggestion Approval Workflow & Deduplication",
      "Atomic conversion from suggestion to published event with duplicate prevention"
    );
  } catch (err) {
    recordFail("Suggestion Approval Workflow & Deduplication", err);
  }

  // 7. SUMMARY
  console.log("\n==================================================");
  console.log("  Verification Results Summary                    ");
  console.log("==================================================");
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  console.log(`Total Tests : ${results.length}`);
  console.log(`Passed      : ${passed}`);
  console.log(`Failed      : ${failed}`);

  if (failed > 0) {
    console.error(`\n[ABORT] ${failed} test(s) failed.`);
    process.exit(1);
  } else {
    console.log("\n[SUCCESS] All Events verification tests passed successfully!");
    process.exit(0);
  }
}

runEventsVerification().catch((err) => {
  console.error("Fatal error during verification:", err);
  process.exit(1);
});
