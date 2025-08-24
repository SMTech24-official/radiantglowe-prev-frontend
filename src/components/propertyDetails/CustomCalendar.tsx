"use client";

import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface CustomCalendarProps {
  moveInDate?: Date;
  moveOutDate?: Date;
  isSelecting: "moveIn" | "moveOut";
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

export default function CustomCalendar({
  moveInDate,
  moveOutDate,
  isSelecting,
  onDateSelect,
}: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const monthNames = [
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
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const generateCalendarDays = (date: Date) => {
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const days = [];

    // Previous month's trailing days
    const prevMonth = new Date(date.getFullYear(), date.getMonth(), 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(
          date.getFullYear(),
          date.getMonth() - 1,
          daysInPrevMonth - i
        ),
      });
    }

    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(date.getFullYear(), date.getMonth(), day),
      });
    }

    // Next month's leading days to fill grid
    const totalCells = 42;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(date.getFullYear(), date.getMonth() + 1, i),
      });
    }

    return days;
  };

  const navigateMonth = (dir: "prev" | "next") => {
    setCurrentDate((prev) => {
      const updated = new Date(prev);
      updated.setMonth(prev.getMonth() + (dir === "next" ? 1 : -1));
      return updated;
    });
  };

  const isSelected = (date: Date) =>
    (isSelecting === "moveIn" && moveInDate?.toDateString() === date.toDateString()) ||
    (isSelecting === "moveOut" && moveOutDate?.toDateString() === date.toDateString());

  const currentMonth = new Date(currentDate);
  const currentMonthDays = generateCalendarDays(currentMonth);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 w-[300px]">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <FiChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <h3 className="text-base font-medium text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={() => navigateMonth("next")}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <FiChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {currentMonthDays.map(({ day, isCurrentMonth, date }, i) => (
            <button
              key={i}
              onClick={() => {
                onDateSelect(date);
              }}
              className={`
                h-8 w-8 text-sm rounded-md flex items-center justify-center transition-colors
                ${
                  !isCurrentMonth
                    ? "text-gray-300"
                    : "text-gray-900 hover:bg-gray-100"
                }
                ${isSelected(date) ? "bg-primary text-white" : ""}
              `}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}