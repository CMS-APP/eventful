import { CalendarDate } from "@/types/CalendarDate";
import { Event } from "@/types/Event";
import { getMonthLength, parseDatabaseDate } from "@/utils/date";

function getCalendarPreviousMonthDays(
  currentMonth: number,
  currentYear: number,
  weekIndex: number
) {
  const previousMonth = currentMonth - 1 < 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth - 1 < 0 ? currentYear - 1 : currentYear;
  const previousMonthLength = getMonthLength(
    new Date(previousYear, previousMonth, 1)
  );

  const week: CalendarDate[] = [];
  for (let i = 0; i < weekIndex; i++) {
    const date = new Date(
      Date.UTC(
        previousYear,
        previousMonth,
        previousMonthLength - (weekIndex - i - 1)
      )
    );
    week.push({ date, type: "previous" });
  }

  return week;
}

function getCalendarFirstWeekDays(currentMonth: number, currentYear: number) {
  const firstDayOfTheMonth = new Date(currentYear, currentMonth, 1);
  const weekIndex =
    firstDayOfTheMonth.getDay() === 0 ? 6 : firstDayOfTheMonth.getDay() - 1;

  const week = getCalendarPreviousMonthDays(
    currentMonth,
    currentYear,
    weekIndex
  );

  for (let i = 0; i < 7 - weekIndex; i++) {
    const date = new Date(Date.UTC(currentYear, currentMonth, i + 1));
    week.push({ date, type: "current" });
  }

  return week;
}

function getCalendarCurrentMonthWeekDays(
  currentMonth: number,
  currentYear: number
) {
  const firstDayOfTheMonth = new Date(currentYear, currentMonth, 1);
  const weekIndex =
    firstDayOfTheMonth.getDay() === 0 ? 6 : firstDayOfTheMonth.getDay() - 1;

  const monthLength = getMonthLength(new Date(currentYear, currentMonth, 1));
  let weeks: CalendarDate[][] = [];
  let week: CalendarDate[] = [];

  for (let i = 7 - weekIndex; i < monthLength; i++) {
    const date = new Date(Date.UTC(currentYear, currentMonth, i + 1));
    if (week.length < 7) {
      week.push({ date, type: "current" });
    } else {
      weeks.push(week);
      week = [];
      week.push({ date, type: "current" });
    }
  }

  weeks = getCalendarFinalWeeks(week, weeks, currentMonth, currentYear);

  return weeks;
}

function getCalendarFinalWeeks(
  finalWeek: CalendarDate[],
  weeksArray: CalendarDate[][],
  currentMonth: number,
  currentYear: number
) {
  let week = finalWeek;
  let weeks = weeksArray;
  let finalWeekLength = finalWeek.length;

  if (finalWeekLength > 0 && finalWeekLength < 7) {
    const nextMonth = currentMonth + 1 > 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth + 1 > 11 ? currentYear + 1 : currentYear;
    for (let i = 0; i < 7 - finalWeekLength; i++) {
      const date = new Date(Date.UTC(nextYear, nextMonth, i + 1));
      week.push({ date, type: "next" });
    }
  }

  weeks.push(week);

  if (weeks.length < 5) {
    for (let i = weeks.length; i < 5; i++) {
      const nextMonth = currentMonth + 1 > 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth + 1 > 11 ? currentYear + 1 : currentYear;
      const week: CalendarDate[] = [];
      for (let j = 0; j < 7; j++) {
        const date = new Date(
          Date.UTC(nextYear, nextMonth, j + 1 + (7 - finalWeekLength))
        );
        week.push({ date, type: "next" });
      }
      weeks.push(week);
    }
  }

  return weeks;
}

export function getCalendarWeeks(currentMonth: number, currentYear: number) {
  const firstWeek = getCalendarFirstWeekDays(currentMonth, currentYear);
  const currentMonthWeeks = getCalendarCurrentMonthWeekDays(
    currentMonth,
    currentYear
  );
  const weeks = [firstWeek, ...currentMonthWeeks];
  return weeks;
}

function checkEventInPreviousMonth(
  eventDate: Date,
  currentMonth: number,
  currentYear: number
) {
  return (
    (eventDate.getMonth() === currentMonth - 1 &&
      eventDate.getFullYear() === currentYear) ||
    (eventDate.getMonth() === 11 &&
      eventDate.getFullYear() === currentYear - 1 &&
      currentMonth === 0)
  );
}

function checkEventInNextMonth(
  eventDate: Date,
  currentMonth: number,
  currentYear: number
) {
  return (
    (eventDate.getMonth() === currentMonth + 1 &&
      eventDate.getFullYear() === currentYear) ||
    (eventDate.getMonth() === 0 &&
      eventDate.getFullYear() === currentYear + 1 &&
      currentMonth === 11)
  );
}

function checkIfEventIsActive(
  activeEventDaysArray: boolean[],
  date: Date,
  currentMonth: number,
  currentYear: number,
  monthLength: number,
  previousWeekLength: number
) {
  let activeEventDays = activeEventDaysArray;
  if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
    const index = date.getDate() + previousWeekLength - 1;
    activeEventDays[index] = true;
  }

  if (
    checkEventInNextMonth(date, currentMonth, currentYear) &&
    monthLength + previousWeekLength + date.getDate() - 1 < 42
  ) {
    const index = date.getDate() + monthLength + previousWeekLength - 1;
    activeEventDays[index] = true;
  }

  if (
    checkEventInPreviousMonth(date, currentMonth, currentYear) &&
    getMonthLength(date) - date.getDate() < previousWeekLength
  ) {
    const index =
      previousWeekLength - (getMonthLength(date) - date.getDate() + 1);
    activeEventDays[index] = true;
  }

  return activeEventDays;
}

export function calculateEventActiveDays(
  allEvents: Event[],
  currentMonth: number,
  currentYear: number
) {
  let activeEventDays = Array(42).fill(false);
  const firstDayOfTheMonth = new Date(currentYear, currentMonth, 1);
  const weekIndex =
    firstDayOfTheMonth.getDay() === 0 ? 6 : firstDayOfTheMonth.getDay() - 1;
  const monthLength = getMonthLength(new Date(currentYear, currentMonth, 1));

  const previousWeekLength = getCalendarPreviousMonthDays(
    currentMonth,
    currentYear,
    weekIndex
  ).length;

  allEvents.forEach((event: Event) => {
    let eventDate = parseDatabaseDate(event.date);
    let eventEndDate = parseDatabaseDate(event.endDate);

    if (eventEndDate) {
      eventDate.setHours(0, 0, 0, 0);
      eventEndDate.setHours(23, 59, 59, 999);
      for (let d = eventDate; d <= eventEndDate; d.setDate(d.getDate() + 1)) {
        activeEventDays = checkIfEventIsActive(
          activeEventDays,
          new Date(d),
          currentMonth,
          currentYear,
          monthLength,
          previousWeekLength
        );
      }
    } else {
      activeEventDays = checkIfEventIsActive(
        activeEventDays,
        eventDate,
        currentMonth,
        currentYear,
        monthLength,
        previousWeekLength
      );
    }
  });

  return activeEventDays;
}
