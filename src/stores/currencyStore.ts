const DEFAULT_CURRENCY = "ZAR";
const DEFAULT_CURRENCY_SYMBOL = "R";

import { create } from "zustand";

type CurrencyState = {
  currency: string;
  symbol: string;

  setCurrency: (value: string | null) => void;
  getCurrencySymbol: (value: string) => void;
};

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currency: localStorage.getItem("currency") ?? DEFAULT_CURRENCY,
  symbol: localStorage.getItem("currencySymbol") ?? DEFAULT_CURRENCY_SYMBOL,

  setCurrency: (value) => {
    if (!value) return;

    localStorage.setItem("currency", value);
    get().getCurrencySymbol(value);

    set({
      currency: value,
    });
  },

  getCurrencySymbol: (value) => {
    const currencySymbol =
      new Intl.NumberFormat("en", {
        style: "currency",
        currency: value,
        currencyDisplay: "narrowSymbol",
      })
        .formatToParts(0)
        .find((p) => p.type === "currency")?.value ?? value;

    localStorage.setItem("currencySymbol", currencySymbol);

    set({
      symbol: currencySymbol,
    });
  },
}));
