import { Metadata } from "next";
import { EventsView } from "@/components/events/events-view";

export const metadata: Metadata = {
  title: "University Events & Activities | BBST Student Magazine",
  description:
    "Discover upcoming events, workshops, seminars, competitions and student community activities from the BBST university community.",
};

export const instant = false;

export default function EventsPage() {
  return <EventsView />;
}
