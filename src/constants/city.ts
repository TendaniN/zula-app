const JAPAN_CITIES = {
  OSAKA: "Osaka",
  TOKYO: "Tokyo",
} as const;
const SOUTH_KOREA_CITIES = {
  SEOUL: "Seoul",
} as const;

const UNITED_ARAB_EMIRATES_CITIES = {
  DUBAI: "Dubai",
  ABU_DHABI: "Abu Dhabi",
} as const;
const OMAN_CITIES = {
  MUSCAT: "Muscat",
} as const;

const BRAZIL_CITIES = {
  RIO_DE_JANEIRO: "Rio de Janeiro",
  SAO_PAULO: "Sao Paulo",
} as const;
const ARGENTINA_CITIES = {
  BUENOS_AIRES: "Buenos Aires",
  MENDOZA: "Mendoza",
} as const;
const CHILE_CITIES = {
  SANTIAGO: "Santiago",
} as const;

const ITALY_CITIES = {
  ROME: "Rome",
  MILAN: "Milan",
  FLORENCE: "Florence",
  NAPLES: "Naples",
  VENICE: "Venice",
  PALERMO: "Palermo",
} as const;
const NORWAY_CITIES = {
  BERGEN: "Begen",
} as const;
const SOUTH_AFRICA_CITIES = {
  CAPE_TOWN: "Cape Town",
  JOHANNESBURG: "Johannesburg",
} as const;
const PHILIPPINES_CITIES = {
  MANILA: "Manila",
  CEBU_CITY: "Cebu City",
  DAVAO_CITY: "Davao City",
  BAGUIO: "Baguio",
  EL_NIDO: "El Nido",
  PUERTO_PRINCESA: "Puerto Princesa",
  BORACAY: "Boracay",
} as const;
const GREECE_CITIES = {
  SANTORINI: "Santorini",
} as const;
const PORTUGAL_CITIES = {
  LISBON: "Lisbon",
  PORTO: "Porto",
} as const;

export const ALL_CITIES = {
  ...JAPAN_CITIES,
  ...SOUTH_KOREA_CITIES,
  ...UNITED_ARAB_EMIRATES_CITIES,
  ...OMAN_CITIES,
  ...BRAZIL_CITIES,
  ...ARGENTINA_CITIES,
  ...CHILE_CITIES,
  ...ITALY_CITIES,
  ...NORWAY_CITIES,
  ...SOUTH_AFRICA_CITIES,
  ...PHILIPPINES_CITIES,
  ...GREECE_CITIES,
  ...PORTUGAL_CITIES,
} as const;

export type CityKeys = keyof typeof ALL_CITIES;
export type CityValues = (typeof ALL_CITIES)[CityKeys];

export const ALL_CITIES_MAP = Object.values(ALL_CITIES);

export const COUNTRY_MAP = [
  {
    country: "Argentina",
    cities: Object.values(ARGENTINA_CITIES),
    code: "AR",
  },
  {
    country: "Brazil",
    cities: Object.values(BRAZIL_CITIES),
    code: "BR",
  },
  {
    country: "Chile",
    cities: Object.values(CHILE_CITIES),
    code: "CL",
  },
  { country: "Japan", cities: Object.values(JAPAN_CITIES), code: "JP" },
  {
    country: "Oman",
    cities: Object.values(OMAN_CITIES),
    code: "OM",
  },
  {
    country: "South Korea",
    cities: Object.values(SOUTH_KOREA_CITIES),
    code: "KR",
  },
  {
    country: "United Arab Emirates",
    cities: Object.values(UNITED_ARAB_EMIRATES_CITIES),
    code: "AE",
  },
  {
    country: "Italy",
    cities: Object.values(ITALY_CITIES),
    code: "IT",
  },
  {
    country: "Norway",
    cities: Object.values(NORWAY_CITIES),
    code: "NO",
  },
  {
    country: "South Africa",
    cities: Object.values(SOUTH_AFRICA_CITIES),
    code: "ZA",
  },
  {
    country: "Philippines",
    cities: Object.values(PHILIPPINES_CITIES),
    code: "PH",
  },
  {
    country: "Greece",
    cities: Object.values(GREECE_CITIES),
    code: "GR",
  },
  {
    country: "Portugal",
    cities: Object.values(PORTUGAL_CITIES),
    code: "PT",
  },
] as const;
