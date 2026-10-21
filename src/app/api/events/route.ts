import { NextRequest, NextResponse } from "next/server";
import { eventRepository } from "@/lib/events/event-repository";
import { EventFilter, EventSortOption } from "@/types/event";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = (searchParams.get("filter") as EventFilter) || undefined;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const sort = (searchParams.get("sort") as EventSortOption) || undefined;
    const selectedDate = searchParams.get("date") || undefined;

    const events = await eventRepository.getEvents({
      filter,
      category,
      search,
      sort,
      selectedDate,
    });

    return NextResponse.json({ success: true, events, count: events.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Events Public API] Error:", msg);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
