import { EventStatus, MagazineEvent } from "@/types/event";

const MONTH_NAMES_SHORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const MONTH_NAMES_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Calculates event status deterministically using startAt and endAt.
 */
export function getEventStatus(
  startAt: string,
  endAt: string,
  now: Date = new Date("2025-10-10T12:00:00+05:30")
): EventStatus {
  const startTime = new Date(startAt).getTime();
  const endTime = new Date(endAt).getTime();
  const currentTime = now.getTime();

  if (currentTime < startTime) {
    return "upcoming";
  } else if (currentTime >= startTime && currentTime <= endTime) {
    return "ongoing";
  } else {
    return "past";
  }
}

/**
 * Formats ISO date into badges: e.g., OCT, 15, 2025
 */
export function formatEventDate(dateString: string): {
  month: string;
  monthFull: string;
  day: string;
  year: string;
  fullDate: string;
} {
  const date = new Date(dateString);
  const monthIndex = date.getMonth();
  const month = MONTH_NAMES_SHORT[monthIndex] || "";
  const monthFull = MONTH_NAMES_FULL[monthIndex] || "";
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear());

  return {
    month,
    monthFull,
    day,
    year,
    fullDate: `${monthFull} ${date.getDate()}, ${year}`,
  };
}

/**
 * Formats start and end times into standard string: e.g. "10:00 AM - 4:00 PM"
 */
export function formatEventTimeRange(startAt: string, endAt: string): string {
  const start = new Date(startAt);
  const end = new Date(endAt);

  const formatTime = (d: Date) => {
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * Extracts YYYY-MM-DD from an ISO string
 */
export function toDateKey(dateInput: Date | string): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface CalendarDayItem {
  date: Date;
  dateKey: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  eventCount: number;
}

/**
 * Generates days for calendar month grid (Sunday to Saturday)
 */
export function getCalendarGrid(
  year: number,
  monthIndex: number,
  eventDateKeys: Set<string>
): CalendarDayItem[] {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday

  const todayKey = toDateKey(new Date());
  const grid: CalendarDayItem[] = [];

  // Padding days from previous month
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNumber = prevMonthLastDay - i;
    const date = new Date(year, monthIndex - 1, dayNumber);
    const dateKey = toDateKey(date);
    grid.push({
      date,
      dateKey,
      dayNumber,
      isCurrentMonth: false,
      isToday: dateKey === todayKey,
      eventCount: eventDateKeys.has(dateKey) ? 1 : 0,
    });
  }

  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day);
    const dateKey = toDateKey(date);
    grid.push({
      date,
      dateKey,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateKey === todayKey,
      eventCount: eventDateKeys.has(dateKey) ? 1 : 0,
    });
  }

  // Padding days to fill final week row (multiple of 7)
  const remainingCells = 7 - (grid.length % 7);
  if (remainingCells < 7) {
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, monthIndex + 1, day);
      const dateKey = toDateKey(date);
      grid.push({
        date,
        dateKey,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
        eventCount: eventDateKeys.has(dateKey) ? 1 : 0,
      });
    }
  }

  return grid;
}

/**
 * Generates RFC 5545 compliant .ics calendar content
 */
export function generateIcsContent(event: MagazineEvent): string {
  const formatDateToIcs = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const startIcs = formatDateToIcs(event.startAt);
  const endIcs = formatDateToIcs(event.endAt);
  const nowIcs = formatDateToIcs(new Date().toISOString());

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BBST Magazine//BBST Events Platform//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@bbstmagazine.ac.lk`,
    `DTSTAMP:${nowIcs}`,
    `DTSTART:${startIcs}`,
    `DTEND:${endIcs}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.excerpt.replace(/\n/g, "\\n")}`,
    `LOCATION:${event.venue}`,
    `STATUS:CONFIRMED`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Triggers standard browser download for .ics calendar file
 */
export function downloadEventIcs(event: MagazineEvent): void {
  if (typeof window === "undefined") return;
  const icsData = generateIcsContent(event);
  const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${event.slug}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
