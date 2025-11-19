(function (global) {
  "use strict";

  const EraConverter = {
    current: null,

    install: function (impl) {
      this.current = impl;
    },

    toEra: function (year, month, day) {
      if (!this.current || typeof this.current.toEra !== "function") return null;
      return this.current.toEra(year, month, day);
    },

    fromEra: function (eraName, eraYear, month, day) {
      if (!this.current || typeof this.current.fromEra !== "function") {
        throw new Error("No era converter installed");
      }
      return this.current.fromEra(eraName, eraYear, month, day);
    }
  };

  const HolidayProvider = {
    current: null,

    install: function (impl) {
      this.current = impl;
    },

    getHolidaysForYear: function (year) {
      if (!this.current || typeof this.current.getHolidaysForYear !== "function") {
        return {};
      }
      return this.current.getHolidaysForYear(year) || {};
    }
  };

  // デフォルト実装の例（ダミー）
  // 祝日なし、元号なしのシンプル版。
  const DefaultEraConverterImpl = {
    toEra: function (year, month, day) {
      return null;
    },
    fromEra: function (eraName, eraYear, month, day) {
      throw new Error("DefaultEraConverterImpl does not support fromEra");
    }
  };

  const DefaultHolidayProviderImpl = {
    getHolidaysForYear: function (year) {
      return {};
    }
  };

  EraConverter.install(DefaultEraConverterImpl);
  HolidayProvider.install(DefaultHolidayProviderImpl);

  global.EraConverter = EraConverter;
  global.HolidayProvider = HolidayProvider;
})(window);
