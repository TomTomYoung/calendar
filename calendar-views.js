(function (global) {
  "use strict";

  const JP_WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

  const defaultViewOptions = {
    cellWidth: 32,
    cellHeight: 32,
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: "12px",
    colorWeekday: "#000000",
    colorWeekend: "#cc0000",
    colorHoliday: "#cc0000",
    colorBackground: "#ffffff",
    colorNthWeekday: {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null
    }
  };

  function mergeOptions(options) {
    if (options && options.__calendarViewMerged) {
      return options;
    }
    const merged = Object.assign({}, defaultViewOptions, options || {});
    merged.colorNthWeekday = Object.assign({}, defaultViewOptions.colorNthWeekday, (options && options.colorNthWeekday) || {});
    Object.defineProperty(merged, "__calendarViewMerged", {
      value: true,
      enumerable: false,
      configurable: false,
      writable: false
    });
    return merged;
  }

  function applyWeekdayLabelStyle(el, orientation, options) {
    const opt = mergeOptions(options);

    el.style.fontFamily = opt.fontFamily;
    el.style.fontSize = opt.fontSize;
    el.style.boxSizing = "border-box";

    if (orientation === "row") {
      el.style.height = opt.cellHeight + "px";
      el.style.minHeight = opt.cellHeight + "px";
      el.style.maxHeight = opt.cellHeight + "px";
    } else {
      el.style.width = opt.cellWidth + "px";
      el.style.minWidth = opt.cellWidth + "px";
      el.style.maxWidth = opt.cellWidth + "px";
    }
  }

  function applyCellStyle(el, day, options) {
    const opt = mergeOptions(options);

    el.style.width = opt.cellWidth + "px";
    el.style.height = opt.cellHeight + "px";
    el.style.display = "inline-flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.fontFamily = opt.fontFamily;
    el.style.fontSize = opt.fontSize;
    el.style.backgroundColor = opt.colorBackground;
    el.style.boxSizing = "border-box";

    let color = opt.colorWeekday;
    if (day.weekday === 0 || day.weekday === 6) {
      color = opt.colorWeekend;
    }
    if (day.isHoliday) {
      color = opt.colorHoliday;
    }
    const nth = day.weekdayIndexInMonth;
    if (opt.colorNthWeekday && opt.colorNthWeekday[nth]) {
      color = opt.colorNthWeekday[nth];
    }

    el.style.color = color;
  }

  function renderGrid(container, yearData, options) {
    container.innerHTML = "";

    yearData.months.forEach(function (month) {
      const monthWrapper = document.createElement("div");
      monthWrapper.className = "calendar-month-grid";

      const title = document.createElement("h2");
      title.textContent = yearData.year + " / " + month.month;
      monthWrapper.appendChild(title);

      const table = document.createElement("table");
      const mergedOptions = mergeOptions(options);
      table.style.width = (mergedOptions.cellWidth * 7) + "px";

      const thead = document.createElement("thead");
      const trHead = document.createElement("tr");
      JP_WEEKDAY_LABELS.forEach(function (label) {
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
        td.textContent = day.date;

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

    yearData.months.forEach(function (month) {
      const row = document.createElement("div");
      row.className = "calendar-row-month";

      const label = document.createElement("span");
      label.textContent = yearData.year + "/" + month.month;
      row.appendChild(label);

      const daysWrapper = document.createElement("div");
      daysWrapper.className = "calendar-row-days";

      month.days.forEach(function (day) {
        const cell = document.createElement("div");
        cell.className = "calendar-row-cell";
        cell.textContent = day.date;
        applyCellStyle(cell, day, options);

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

    yearData.months.forEach(function (month) {
      const col = document.createElement("div");
      col.className = "calendar-column-month";

      const label = document.createElement("div");
      label.textContent = yearData.year + "/" + month.month;
      col.appendChild(label);

      month.days.forEach(function (day) {
        const cell = document.createElement("div");
        cell.className = "calendar-column-cell";
        cell.textContent = day.date;
        applyCellStyle(cell, day, options);

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
