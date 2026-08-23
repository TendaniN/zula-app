import { Select } from "@mantine/core";
import currencies from "currency-codes";
import { useCurrencyStore } from "@/stores/currencyStore";

const CURRENCY_OPTIONS = currencies.data
  .filter((currency) => currency.code)
  .map((currency) => ({
    value: currency.code,
    label: `${currency.code} — ${currency.currency}`,
  }))
  .sort((a, b) => a.value.localeCompare(b.value));

export function CurrencySelect() {
  const { currency, setCurrency } = useCurrencyStore();

  return (
    <Select
      data={CURRENCY_OPTIONS}
      value={currency}
      onChange={setCurrency}
      searchable
      bd="none"
      label="Currency"
      nothingFoundMessage="No currency found"
      bg="transparent"
      allowDeselect={false}
      withAlignedLabels
      styles={{
        option: {
          "--combobox-option-fz": "var(--mantine-font-size-sm)",
        },
        input: {
          color: "var(--text-color)",
          fontSize: "var(--mantine-font-size-sm)",
          fontWeight: 600,
          height: "2.5rem",
          minHeight: "1.5rem",
        },
      }}
    />
  );
}
