/**
 *
 * Default packing suggestions, grouped by bag.  These constants are just the suggested item list.
 *
 * `needTag` marks items gated behind an opt-in need (bras, period care, …) so
 * the panel can filter inclusively — by what someone actually packs for, never
 * by gender. Untagged items are the universal base everyone sees.
 *
 * Items under "extra suggestions" were added on top of the source list as
 * common-but-easily-forgotten additions — trim any that don't apply.
 */

export type PackingBag =
  "Luggage" | "Makeup Bag" | "Toiletry Bag" | "Medicine Bag" | "Airport Bag";

/** Opt-in need tags — the traveller selects these; items map to them. */
export type PackingNeedTag = "bras" | "period-care" | "makeup" | "shaving";

export const NEED_TAG_LABELS: Record<PackingNeedTag, string> = {
  bras: "Bras",
  "period-care": "Period care",
  makeup: "Makeup",
  shaving: "Shaving",
};

export interface PackingItem {
  id: string;
  label: string;
  /** The parenthetical breakdown / notes from the source list. */
  note?: string;
  /** If set, this item only appears when the traveller opts into that need. */
  needTag?: PackingNeedTag;
}

export interface PackingBagGroup {
  bag: PackingBag;
  description?: string;
  items: PackingItem[];
}

export const PACKING_SUGGESTIONS: PackingBagGroup[] = [
  {
    bag: "Luggage",
    description: "Main checked bag — clothing and shoes",
    items: [
      { id: "lug-tops", label: "Tops", note: "e.g. tops; sweatshirt" },
      {
        id: "lug-bottoms",
        label: "Bottoms",
        note: "jeans; skirts; pants; shorts",
      },
      { id: "lug-dresses", label: "Dresses" },
      { id: "lug-jumpsuits", label: "Jumpsuits" },
      { id: "lug-jackets", label: "Jackets / coats" },
      { id: "lug-handbags", label: "Handbags", note: "incl. belt bag" },
      { id: "lug-sunglasses", label: "Sunglasses" },
      {
        id: "lug-shoes",
        label: "Shoes",
        note: "flip flops; sandals; sneakers",
      },
      { id: "lug-underwear", label: "Underwear" },
      { id: "lug-socks", label: "Socks" },
      { id: "lug-bras", label: "Bras", needTag: "bras" },
      // — extra suggestions —
      { id: "lug-sleepwear", label: "Sleepwear / pyjamas" },
      { id: "lug-swimwear", label: "Swimwear" },
      { id: "lug-activewear", label: "Activewear", note: "if hiking / gym" },
      { id: "lug-belt", label: "Belt" },
    ],
  },
  {
    bag: "Makeup Bag",
    description: "Inside the luggage",
    items: [
      {
        id: "mk-foundation",
        label: "Foundation",
        note: "stick",
        needTag: "makeup",
      },
      { id: "mk-concealer", label: "Concealer", needTag: "makeup" },
      {
        id: "mk-contour",
        label: "Contour",
        note: "palette",
        needTag: "makeup",
      },
      { id: "mk-blush", label: "Blush", needTag: "makeup" },
      { id: "mk-primer", label: "Primer", needTag: "makeup" },
      {
        id: "mk-setting",
        label: "Setting",
        note: "spray; powder",
        needTag: "makeup",
      },
      {
        id: "mk-brushes",
        label: "Brushes",
        note: "blush; foundation; brow; concealer",
        needTag: "makeup",
      },
      {
        id: "mk-blenders",
        label: "Blenders",
        note: "sponge; triangle",
        needTag: "makeup",
      },
      { id: "mk-lipstick", label: "Lipstick", needTag: "makeup" },
      {
        id: "mk-lipgloss",
        label: "Lip gloss",
        note: "clear; sparkly",
        needTag: "makeup",
      },
      { id: "mk-highlighter", label: "Highlighter", needTag: "makeup" },
      { id: "mk-eyeliner", label: "Eyeliner", needTag: "makeup" },
      { id: "mk-earrings", label: "Earrings", note: "studs; statement" },
      // — extra suggestions —
      { id: "mk-mascara", label: "Mascara", needTag: "makeup" },
      { id: "mk-remover", label: "Makeup remover", needTag: "makeup" },
    ],
  },
  {
    bag: "Toiletry Bag",
    description: "Inside the luggage",
    items: [
      { id: "toi-wash-acc", label: "Wash accessories", note: "cloth; gloves" },
      { id: "toi-shower-gel", label: "Shower gel", note: "gel; scrub" },
      { id: "toi-moisturiser", label: "Moisturiser", note: "lotion; butter" },
      { id: "toi-face-wash", label: "Face wash", note: "wash; exfoliant" },
      { id: "toi-serums", label: "Serums" },
      { id: "toi-face-creams", label: "Face creams", note: "night; day" },
      { id: "toi-sun", label: "Sun protection", note: "face; body" },
      { id: "toi-perfume", label: "Perfume" },
      { id: "toi-rollon", label: "Roll-on" },
      { id: "toi-braid-spray", label: "Braid spray" },
      {
        id: "toi-hair-acc",
        label: "Hair accessories",
        note: "scrunchies; headbands; ties",
      },
      { id: "toi-shower-cap", label: "Shower cap" },
      { id: "toi-bonnet", label: "Bonnet" },
      { id: "toi-hand-wipes", label: "Hand wipes" },
      { id: "toi-nail-glue", label: "Nail glue" },
      { id: "toi-nail-file", label: "Nail file" },
      { id: "toi-hats", label: "Hats", note: "bucket; cap" },
      { id: "toi-edges", label: "Edges", note: "gel; brush; spray" },
      { id: "toi-scarf", label: "Scarf" },
      { id: "toi-brow-razor", label: "Brow razor", needTag: "shaving" },
      { id: "toi-teeth", label: "Toothpaste" },
      { id: "toi-cotton-pads", label: "Cotton pads" },
      { id: "toi-feminine", label: "Pantyliners", needTag: "period-care" },
      // — extra suggestions —
      { id: "toi-deodorant", label: "Deodorant" },
      { id: "toi-hairbrush", label: "Hairbrush / comb" },
      { id: "toi-razor", label: "Razor", needTag: "shaving" },
      { id: "toi-tweezers", label: "Tweezers" },
      { id: "toi-tampons", label: "Tampons / cup", needTag: "period-care" },
      {
        id: "toi-contacts",
        label: "Contact lenses / solution",
        note: "if worn",
      },
    ],
  },
  {
    bag: "Medicine Bag",
    description: "Inside the luggage",
    items: [
      { id: "med-face-masks", label: "Face masks" },
      { id: "med-face-tissues", label: "Face tissues" },
      { id: "med-throat-spray", label: "Throat spray" },
      { id: "med-strepsils", label: "Strepsils" },
      { id: "med-acc200", label: "ACC200" },
      { id: "med-corenza", label: "Corenza-C" },
      { id: "med-rehidrat", label: "Rehidrat" },
      { id: "med-allergex", label: "Allergex" },
      { id: "med-biotin", label: "Biotin" },
      { id: "med-echinaforce", label: "Echinaforce" },
      { id: "med-sinutab", label: "Sinutab" },
      { id: "med-antiseptic", label: "Antiseptic" },
      // — extra suggestions —
      {
        id: "med-painkillers",
        label: "Painkillers",
        note: "paracetamol / ibuprofen",
      },
      { id: "med-plasters", label: "Plasters" },
      { id: "med-antidiarrheal", label: "Anti-diarrhoeal" },
      { id: "med-motion", label: "Motion sickness", note: "if needed" },
      {
        id: "med-prescriptions",
        label: "Prescription meds",
        note: "pack enough for the trip",
      },
    ],
  },
  {
    bag: "Airport Bag",
    description: "Carry-on — keep on you",
    items: [
      { id: "air-hand-wipes", label: "Hand wipes" },
      { id: "air-gum", label: "Gum" },
      { id: "air-sanitizer", label: "Sanitizer" },
      { id: "air-hand-cream", label: "Hand cream" },
      { id: "air-powerbank", label: "Powerbank", note: "& cable" },
      { id: "air-tablet", label: "Tablet" },
      { id: "air-charger", label: "Charger" },
      {
        id: "air-phone",
        label: "Phone",
        note: "e-ticket; insurance; passport copy",
      },
      { id: "air-id", label: "Identification", note: "passport; ID card" },
      { id: "air-scarf", label: "Scarf" },
      { id: "air-sunglasses", label: "Sunglasses" },
      { id: "air-lipstick", label: "Lipstick", needTag: "makeup" },
      { id: "air-lip-ice", label: "Lip ice", note: "Blistex; Vaseline" },
      { id: "air-purse", label: "Purse" },
      { id: "air-face-tissues", label: "Face tissues" },
      { id: "air-earphones", label: "Earphones", note: "wired; pods" },
      { id: "air-hair-acc", label: "Hair accessories", note: "tie; headband" },
      { id: "air-face-masks", label: "Face masks" },
      { id: "air-hat", label: "Hat" },
      { id: "air-allergex", label: "Allergex" },
      { id: "air-perfume", label: "Perfume" },
      { id: "air-teeth", label: "Toothbrush" },
      { id: "air-camera", label: "Digital camera" },
      // — extra suggestions —
      {
        id: "air-adapter",
        label: "Universal power adapter",
        note: "essential for international trips",
      },
      {
        id: "air-water-bottle",
        label: "Reusable water bottle",
        note: "empty through security",
      },
      { id: "air-pen", label: "Pen", note: "for landing / customs cards" },
      { id: "air-snacks", label: "Snacks" },
      { id: "air-cash", label: "Cash / cards", note: "some local currency" },
      { id: "air-travel-pillow", label: "Travel pillow" },
    ],
  },
];
