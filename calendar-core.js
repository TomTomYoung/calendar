(function (global) {
  "use strict";

  const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function buildYearData(year) {
    const months = [];
    const holidayMap = HolidayProvider.getHolidaysForYear(year);

    for (let m = 1; m <= 12; m++) {
      const daysInMonth = CalendarAlgorithmManager.getDaysInMonth(year, m);
      const days = [];
      const weekdayCount = [0, 0, 0, 0, 0, 0, 0];

      for (let d = 1; d <= daysInMonth; d++) {
        const w = CalendarAlgorithmManager.getWeekday(year, m, d);
        weekdayCount[w] += 1;

        const key = m + "-" + d;
        const holidayInfo = holidayMap[key];

        const era = EraConverter.toEra(year, m, d);

        const dayObj = {
          date: d,
          weekday: w,
          weekdayName: WEEKDAY_LABELS[w],
          weekdayIndexInMonth: weekdayCount[w],
          isHoliday: !!holidayInfo,
          holidayName: holidayInfo ? (holidayInfo.name || null) : null,
          era: era
        };

        days.push(dayObj);
      }

      months.push({
        month: m,
        daysInMonth: daysInMonth,
        days: days
      });
    }

    return {
      year: year,
      calendarAlgorithm: CalendarAlgorithmManager.getCurrentAlgorithm(),
      months: months
    };
  }

  global.CalendarCore = {
    buildYearData: buildYearData
  };
})(window);
