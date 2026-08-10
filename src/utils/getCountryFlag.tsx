import * as Flags from "country-flag-icons/react/3x2";
import type { ComponentType, SVGProps } from "react";
import { COUNTRY_MAP } from "@/constants/city";

type CountryCode = keyof typeof Flags;
type FlagComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const getCountryFlag = (
  country: string,
  size = 36,
  border = "1px solid #dedede",
): React.ReactNode | null => {
  const countryData = COUNTRY_MAP.find((item) => item.country === country);
  if (!countryData?.code) return null;

  const Flag = Flags[countryData.code as CountryCode] as
    FlagComponent | undefined;
  if (!Flag) return null;

  return (
    <Flag
      key={`flag-${country}`}
      width={size}
      style={{
        border,
        borderRadius: "var(--mantine-radius-sm)",
        display: "block",
        flexShrink: 0,
      }}
    />
  );
};
