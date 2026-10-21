import { Metadata } from "next";
import { connection } from "next/server";
import { eventRepository } from "@/lib/events/event-repository";
import { EventsView } from "@/components/events/events-view";

export const metadata: Metadata = {
  title: "Events & Workshops | BBST Student Magazine",
  description:
    "Discover upcoming webinars, student research symposiums, and editorial workshops organized by BBST Student Magazine of Uva Wellassa University.",
};

export const instant = false;

export default async function EventsPage() {
  await connection();
  const [initialEvents, initialPastEvents, initialUpcomingThisMonth, dateKeysSet] =
    await Promise.all([
      eventRepository.getEvents(),
      eventRepository.getPastEvents(4),
      eventRepository.getUpcomingThisMonth(),
      eventRepository.getAllEventDateKeys(),
    ]);

  return (
    <EventsView
      initialEvents={initialEvents}
      initialPastEvents={initialPastEvents}
      initialUpcomingThisMonth={initialUpcomingThisMonth}
      initialDateKeys={Array.from(dateKeysSet)}
    />
  );
}
