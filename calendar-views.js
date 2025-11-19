(function (global) {
  "use strict";

  const DEFAULT_WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
  const DEFAULT_DAY_NUMBER_LABELS = Array.from({ length: 31 }, function (_, index) {
    return String(index + 1);
  });

  const defaultViewOptions = {
    typography: {
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: "12px",
      weekdayTextColor: "#000000",
      weekendTextColor: "#cc0000",
      holidayTextColor: "#cc0000",
      nthWeekdayTextColor: {
        1: null,
        2: null,
        3: null,
        4: null,
        5: null
      }
    },
    cell: {
      width: 32,
      height: 32,
      paddingX: 0,
      paddingY: 0,
      backgroundColor: "#ffffff",
      border: {
        width: 1,
        style: "solid",
        color: "#dddddd",
        radius: 0
      }
    },
    labels: {
      yearMonthFormat: "{year} / {month}",
      weekdayLabels: DEFAULT_WEEKDAY_LABELS,
      dayNumberLabels: DEFAULT_DAY_NUMBER_LABELS
    }
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function mergeDeep(target, source) {
    Object.keys(source || {}).forEach(function (key) {
      const value = source[key];
      if (value && typeof value === "object" && !Array.isArray(value)) {
        if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key])) {
          target[key] = {};
        }
        mergeDeep(target[key], value);
      } else if (Array.isArray(value)) {
        target[key] = value.slice();
      } else {
        target[key] = value;
      }
    });
    return target;
  }

  function mergeOptions(options) {
    if (options && options.__calendarViewMerged) {
      return options;
    }
    const merged = clone(defaultViewOptions);
    mergeDeep(merged, options || {});
    if (!merged.typography || typeof merged.typography !== "object") {
      merged.typography = clone(defaultViewOptions.typography);
    }
    if (!merged.typography.nthWeekdayTextColor || typeof merged.typography.nthWeekdayTextColor !== "object") {
      merged.typography.nthWeekdayTextColor = clone(defaultViewOptions.typography.nthWeekdayTextColor);
    }
    if (!merged.cell || typeof merged.cell !== "object") {
      merged.cell = clone(defaultViewOptions.cell);
    }
    if (!merged.cell.border || typeof merged.cell.border !== "object") {
      merged.cell.border = clone(defaultViewOptions.cell.border);
    }
    if (!merged.labels || typeof merged.labels !== "object") {
      merged.labels = clone(defaultViewOptions.labels);
    }
    if (!Array.isArray(merged.labels.weekdayLabels) || merged.labels.weekdayLabels.length !== 7) {
      merged.labels.weekdayLabels = defaultViewOptions.labels.weekdayLabels.slice();
    } else {
      merged.labels.weekdayLabels = merged.labels.weekdayLabels.slice(0, 7);
    }
    if (!Array.isArray(merged.labels.dayNumberLabels)) {
      merged.labels.dayNumberLabels = defaultViewOptions.labels.dayNumberLabels.slice();
    } else {
      const filled = defaultViewOptions.labels.dayNumberLabels.slice();
      merged.labels.dayNumberLabels.forEach(function (value, index) {
        if (index < 31 && value !== undefined && value !== null) {
          filled[index] = String(value);
        }
      });
      merged.labels.dayNumberLabels = filled;
    }
    Object.defineProperty(merged, "__calendarViewMerged", {
      value: true,
      enumerable: false,
      configurable: false,
      writable: false
    });
    return merged;
  }

  function ensureMerged(options) {
    return options && options.__calendarViewMerged ? options : mergeOptions(options);
  }

  function formatYearMonthLabel(formatString, year, month) {
    if (typeof formatString === "string" && formatString.length > 0) {
      return formatString.replace(/\{year\}/g, year).replace(/\{month\}/g, month);
    }
    return year + " / " + month;
  }

  function applyWeekdayLabelStyle(el, orientation, options) {
    const opt = ensureMerged(options);
    const cell = opt.cell;
    const typography = opt.typography;

    el.style.fontFamily = typography.fontFamily;
    el.style.fontSize = typography.fontSize;
    el.style.boxSizing = "border-box";
    const tag = (el.tagName || "").toLowerCase();
    if (tag === "th" || tag === "td") {
      el.style.display = "table-cell";
      el.style.textAlign = "center";
      el.style.verticalAlign = "middle";
    } else {
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.textAlign = "center";
    }

    if (orientation === "row") {
      el.style.height = cell.height + "px";
      el.style.minHeight = cell.height + "px";
      el.style.maxHeight = cell.height + "px";
    } else {
      el.style.width = cell.width + "px";
      el.style.minWidth = cell.width + "px";
      el.style.maxWidth = cell.width + "px";
    }

    el.style.padding = cell.paddingY + "px " + cell.paddingX + "px";
    el.style.borderStyle = cell.border.style;
    el.style.borderWidth = cell.border.width + "px";
    el.style.borderColor = cell.border.color;
    el.style.borderRadius = cell.border.radius + "px";
    el.style.backgroundColor = cell.backgroundColor;
  }

  function applyCellStyle(el, day, options) {
    const opt = ensureMerged(options);
    const cell = opt.cell;
    const typography = opt.typography;
    const tag = (el.tagName || "").toLowerCase();

    el.style.width = cell.width + "px";
    el.style.height = cell.height + "px";
    el.style.padding = cell.paddingY + "px " + cell.paddingX + "px";

    el.style.fontFamily = typography.fontFamily;
    el.style.fontSize = typography.fontSize;
    el.style.backgroundColor = cell.backgroundColor;
    el.style.boxSizing = "border-box";
    el.style.borderStyle = cell.border.style;
    el.style.borderWidth = cell.border.width + "px";
    el.style.borderColor = cell.border.color;
    el.style.borderRadius = cell.border.radius + "px";
    el.style.textAlign = "center";
    if (tag === "td" || tag === "th") {
      el.style.display = "table-cell";
      el.style.verticalAlign = "middle";
    } else {
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
    }

    let color = typography.weekdayTextColor;
    if (day.weekday === 0 || day.weekday === 6) {
      color = typography.weekendTextColor;
    }
    if (day.isHoliday) {
      color = typography.holidayTextColor;
    }
    const nth = day.weekdayIndexInMonth;
    if (nth && typography.nthWeekdayTextColor && typography.nthWeekdayTextColor[nth]) {
      color = typography.nthWeekdayTextColor[nth];
    }

    el.style.color = color;
  }

  function getDayNumberLabel(dayNumber, options) {
    const opt = ensureMerged(options);
    const labels = opt.labels.dayNumberLabels;
    const index = Math.max(1, Math.min(31, dayNumber)) - 1;
    const label = labels[index];
    if (label === undefined || label === null) {
      return String(dayNumber);
    }
    return String(label);
  }

  function renderGrid(container, yearData, options) {
    container.innerHTML = "";

    const mergedOptions = mergeOptions(options);

    yearData.months.forEach(function (month) {
      const monthWrapper = document.createElement("div");
      monthWrapper.className = "calendar-month-grid";

      const title = document.createElement("h2");
      title.textContent = formatYearMonthLabel(mergedOptions.labels.yearMonthFormat, yearData.year, month.month);
      monthWrapper.appendChild(title);

      const table = document.createElement("table");
      table.style.width = (mergedOptions.cell.width * 7) + "px";

      const thead = document.createElement("thead");
      const trHead = document.createElement("tr");
      mergedOptions.labels.weekdayLabels.forEach(function (label) {
        const th = document.createElement("th");
        th.textContent = label;
        applyWeekdayLabelStyle(th, "column", mergedOptions);
        trHead.appendChild(th);
      });
      thead.appendChild(trHead);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      let tr = document.createElement("tr");
      let cellIndex = 0;

      const firstWeekday = month.days[0].weekday;
      for (let i = 0; i < firstWeekday; i++) {
        const emptyTd = document.createElement("td");
        tr.appendChild(emptyTd);
        cellIndex++;
      }

      month.days.forEach(function (day) {
        if (cellIndex > 0 && cellIndex % 7 === 0) {
          tbody.appendChild(tr);
          tr = document.createElement("tr");
        }
        const td = document.createElement("td");
        td.textContent = getDayNumberLabel(day.date, mergedOptions);

        applyCellStyle(td, day, mergedOptions);

        td.title = "曜日: " + day.weekdayName +
                   (day.weekdayIndexInMonth ? " / 第" + day.weekdayIndexInMonth + "週" : "") +
                   (day.isHoliday && day.holidayName ? " / " + day.holidayName : "");

        tr.appendChild(td);
        cellIndex++;
      });

      if (tr.children.length > 0) {
        while (tr.children.length < 7) {
          tr.appendChild(document.createElement("td"));
        }
        tbody.appendChild(tr);
      }

      table.appendChild(tbody);
      monthWrapper.appendChild(table);
      container.appendChild(monthWrapper);
    });
  }

  function renderRow(container, yearData, options) {
    container.innerHTML = "";

    const mergedOptions = mergeOptions(options);

    yearData.months.forEach(function (month) {
      const row = document.createElement("div");
      row.className = "calendar-row-month";

      const label = document.createElement("span");
      label.textContent = formatYearMonthLabel(mergedOptions.labels.yearMonthFormat, yearData.year, month.month);
      row.appendChild(label);

      const daysWrapper = document.createElement("div");
      daysWrapper.className = "calendar-row-days";

      month.days.forEach(function (day) {
        const cell = document.createElement("div");
        cell.className = "calendar-row-cell";
        cell.textContent = getDayNumberLabel(day.date, mergedOptions);
        applyCellStyle(cell, day, mergedOptions);

        cell.title = "曜日: " + day.weekdayName +
                     (day.weekdayIndexInMonth ? " / 第" + day.weekdayIndexInMonth + "週" : "") +
                     (day.isHoliday && day.holidayName ? " / " + day.holidayName : "");

        daysWrapper.appendChild(cell);
      });

      row.appendChild(daysWrapper);
      container.appendChild(row);
    });
  }

  function renderColumn(container, yearData, options) {
    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "calendar-column-wrapper";

    const mergedOptions = mergeOptions(options);

    yearData.months.forEach(function (month) {
      const col = document.createElement("div");
      col.className = "calendar-column-month";

      const label = document.createElement("div");
      label.textContent = formatYearMonthLabel(mergedOptions.labels.yearMonthFormat, yearData.year, month.month);
      col.appendChild(label);

      month.days.forEach(function (day) {
        const cell = document.createElement("div");
        cell.className = "calendar-column-cell";
        cell.textContent = getDayNumberLabel(day.date, mergedOptions);
        applyCellStyle(cell, day, mergedOptions);

        cell.title = "曜日: " + day.weekdayName +
                     (day.weekdayIndexInMonth ? " / 第" + day.weekdayIndexInMonth + "週" : "") +
                     (day.isHoliday && day.holidayName ? " / " + day.holidayName : "");

        col.appendChild(cell);
      });

      wrapper.appendChild(col);
    });

    container.appendChild(wrapper);
  }

  global.CalendarViews = {
    renderGrid: renderGrid,
    renderRow: renderRow,
    renderColumn: renderColumn
  };
})(window);
