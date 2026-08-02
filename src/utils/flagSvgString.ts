import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import * as Flags from "country-flag-icons/react/3x2";
import { COUNTRY_MAP } from "@/constants/city";

type CountryCode = keyof typeof Flags;

const flagSvgString = (country: string): string | null => {
  const countryData = COUNTRY_MAP.find((item) => item.country === country);
  if (!countryData?.code) return null;

  const Flag = Flags[countryData.code as CountryCode];
  if (!Flag) return null;

  let svg = renderToStaticMarkup(createElement(Flag, { title: country }));

  // ensure it's a valid standalone SVG so it loads as an image
  if (!svg.includes("xmlns")) {
    svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  return svg;
};

const toSvgDataUri = (svg: string) =>
  `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

// SVG data URI — crisp/vector, needs PowerPoint 2016+
export const getCountryFlagSvgUri = (country: string): string | null => {
  const svg = flagSvgString(country);
  return svg ? toSvgDataUri(svg) : null;
};
