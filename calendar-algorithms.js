(function (global) {
  "use strict";

  const CalendarAlgorithms = {
    sakamoto: function (y, m, d) {
      const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
      if (m < 3) y -= 1;
      const w = (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + t[m - 1] + d) % 7;
      return (w + 7) % 7;
    },

    zeller: function (y, m, d) {
      if (m < 3) {
        m += 12;
        y -= 1;
      }
      const K = y % 100;
      const J = Math.floor(y / 100);
      const h = (d + Math.floor(13 * (m + 1) / 5) + K + Math.floor(K / 4) + Math.floor(J / 4) + 5 * J) % 7;
      const weekday = (h + 6) % 7; // h:0=土 → 0=日 に変換
      return weekday;
    },

    dateApi: function (y, m, d) {
      const date = new Date(y, m - 1, d);
      return date.getDay();
    }
  };

  let currentAlgorithm = "sakamoto";

  function setCalendarAlgorithm(name) {
    if (!CalendarAlgorithms[name]) {
      throw new Error("Unknown calendar algorithm: " + name);
    }
    currentAlgorithm = name;
  }

  function getWeekday(y, m, d) {
    return CalendarAlgorithms[currentAlgorithm](y, m, d);
  }

  function getCurrentAlgorithm() {
    return currentAlgorithm;
  }

  function isLeapYear(year) {
    if (year % 400 === 0) return true;
    if (year % 100 === 0) return false;
    if (year % 4 === 0) return true;
    return false;
  }

  function getDaysInMonth(year, month) {
    switch (month) {
      case 1: case 3: case 5: case 7: case 8: case 10: case 12:
        return 31;
      case 4: case 6: case 9: case 11:
        return 30;
      case 2:
        return isLeapYear(year) ? 29 : 28;
      default:
        throw new Error("Invalid month: " + month);
    }
  }

  global.CalendarAlgorithms = CalendarAlgorithms;
  global.CalendarAlgorithmManager = {
    setCalendarAlgorithm,
    getWeekday,
    getDaysInMonth,
    getCurrentAlgorithm,
    isLeapYear
  };
})(window);
