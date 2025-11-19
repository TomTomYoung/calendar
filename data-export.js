(function (global) {
  "use strict";

  function toJSON(yearData) {
    return JSON.stringify(yearData, null, 2);
  }

  function toCSV(yearData) {
    const rows = [];
    rows.push([
      "year",
      "month",
      "date",
      "weekday",
      "weekdayName",
      "weekdayIndexInMonth",
      "isHoliday",
      "holidayName",
      "eraName",
      "eraYear"
    ].join(","));

    yearData.months.forEach(function (month) {
      month.days.forEach(function (day) {
        const eraName = day.era && day.era.name ? day.era.name : "";
        const eraYear = day.era && day.era.year ? String(day.era.year) : "";
        rows.push([
          yearData.year,
          month.month,
          day.date,
          day.weekday,
          day.weekdayName,
          day.weekdayIndexInMonth,
          day.isHoliday ? "true" : "false",
          day.holidayName ? day.holidayName.replace(/"/g, '""') : "",
          eraName.replace(/"/g, '""'),
          eraYear
        ].map(function (v) {
          if (/[",\n]/.test(String(v))) {
            return '"' + String(v) + '"';
          }
          return String(v);
        }).join(","));
      });
    });

    return rows.join("\n");
  }

  function yamlEscapeString(str) {
    if (str === null || str === undefined) return "''";
    if (str === "") return "''";
    if (/^[a-zA-Z0-9_\-]+$/.test(str)) {
      return str;
    }
    return "'" + String(str).replace(/'/g, "''") + "'";
  }

  function toYAML(yearData) {
    const lines = [];
    lines.push("year: " + yearData.year);
    lines.push("calendarAlgorithm: " + yamlEscapeString(yearData.calendarAlgorithm));
    lines.push("months:");
    yearData.months.forEach(function (month) {
      lines.push("  - month: " + month.month);
      lines.push("    daysInMonth: " + month.daysInMonth);
      lines.push("    days:");
      month.days.forEach(function (day) {
        lines.push("      - date: " + day.date);
        lines.push("        weekday: " + day.weekday);
        lines.push("        weekdayName: " + yamlEscapeString(day.weekdayName));
        lines.push("        weekdayIndexInMonth: " + day.weekdayIndexInMonth);
        lines.push("        isHoliday: " + (day.isHoliday ? "true" : "false"));
        if (day.holidayName) {
          lines.push("        holidayName: " + yamlEscapeString(day.holidayName));
        } else {
          lines.push("        holidayName: null");
        }
        if (day.era) {
          if (day.era.name) {
            lines.push("        era:");
            lines.push("          name: " + yamlEscapeString(day.era.name));
            lines.push("          year: " + (day.era.year != null ? day.era.year : "null"));
          } else {
            lines.push("        era: null");
          }
        } else {
          lines.push("        era: null");
        }
      });
    });
    return lines.join("\n");
  }

  global.DataExport = {
    toJSON: toJSON,
    toCSV: toCSV,
    toYAML: toYAML
  };
})(window);
