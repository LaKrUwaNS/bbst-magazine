"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from "lucide-react";
import { getCalendarGrid } from "@/lib/events/event-date-utils";

interface EventCalendarProps {
  eventDateKeys: Set<string>;
  selectedDate?: string; // YYYY-MM-DD
  onSelectDate: (dateKey: string | undefined) => void;
}

const MONTH_NAMES = [
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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function EventCalendar({
  eventDateKeys,
  selectedDate,
  onSelectDate,
}: EventCalendarProps) {
  // Initialize to October 2025 (matching reference screenshot) or current year
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // 9 = October

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const grid = getCalendarGrid(currentYear, currentMonthIndex, eventDateKeys);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-2xs">
      {/* Calendar Header matching screenshot */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm sm:text-base text-[#171717] flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#00C800]" />
          <span>Event Calendar</span>
        </h3>

        {/* Selected date badge / clear filter action */}
        {selectedDate && (
          <button
            type="button"
            onClick={() => onSelectDate(undefined)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00A800] hover:text-[#008800] bg-emerald-50 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
            title="Clear date filter"
          >
            <span>{selectedDate}</span>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          aria-label="Previous month"
          className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs sm:text-sm font-bold text-[#171717]">
          {MONTH_NAMES[currentMonthIndex]} {currentYear}
        </span>

        <button
          type="button"
          onClick={handleNextMonth}
          aria-label="Next month"
          className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday headers: Sun Mon Tue Wed Thu Fri Sat */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase py-1"
          >
            {day}
          </span>
        ))}
      </div>

      {/* Calendar Date Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {grid.map((cell) => {
          const isSelected = selectedDate === cell.dateKey;
          const hasEvent = cell.eventCount > 0;

          return (
            <button
              key={cell.dateKey}
              type="button"
              disabled={!cell.isCurrentMonth}
              onClick={() => {
                if (isSelected) {
                  onSelectDate(undefined);
                } else {
                  onSelectDate(cell.dateKey);
                }
              }}
              aria-label={`${cell.dayNumber} ${MONTH_NAMES[currentMonthIndex]} ${currentYear}${hasEvent ? ", has events" : ""
                }`}
              className={`relative flex flex-col items-center justify-center w-full aspect-square rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${!cell.isCurrentMonth
                  ? "text-gray-200 pointer-events-none"
                  : isSelected
                    ? "bg-[#171717] text-white shadow-xs font-bold"
                    : hasEvent
                      ? "bg-[#00E500] hover:bg-[#00D000] text-black font-extrabold shadow-2xs hover:scale-105"
                      : cell.isToday
                        ? "bg-gray-100 text-gray-900 font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <span>{cell.dayNumber}</span>
              {/* Event indicator dot if selected or multi-event */}
              {hasEvent && !isSelected && (
                <span className="sr-only">(event scheduled)</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
