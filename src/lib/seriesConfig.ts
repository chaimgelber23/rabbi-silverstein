import type { SeriesDef, Shiur } from "./types";

function extractPerek(shiur: Shiur, prefix: RegExp): { section?: string; detail?: string } {
  const cleaned = shiur.title.replace(prefix, "").trim();
  const perekMatch = cleaned.match(/^(?:perek\s*)?(\d+)/i);
  return perekMatch ? { section: `Perek ${perekMatch[1]}` } : {};
}

function extractTanyaPerek(shiur: Shiur): { section?: string; detail?: string } {
  const perekMatch = shiur.title.match(/Perek\s+(\d+)/i);
  return perekMatch ? { section: `Perek ${perekMatch[1]}` } : {};
}

const PARSHA_NAMES = [
  "Bereishis", "Noach", "Lech Lecha", "Vayeira", "Chayei Sarah", "Toldos", "Vayeitzei",
  "Vayishlach", "Vayeshev", "Mikeitz", "Vayigash", "Vayechi", "Shemos", "Va'eira", "Bo",
  "Beshalach", "Yisro", "Mishpatim", "Terumah", "Tetzaveh", "Ki Sisa", "Vayakhel",
  "Pekudei", "Vayikra", "Tzav", "Shemini", "Tazria", "Metzora", "Acharei Mos", "Kedoshim",
  "Emor", "Behar", "Bechukosai", "Bamidbar", "Naso", "Beha'aloscha", "Shelach", "Korach",
  "Chukas", "Balak", "Pinchas", "Matos", "Masei", "Devorim", "Va'eschanan", "Eikev",
  "Re'eh", "Shoftim", "Ki Seitzei", "Ki Savo", "Nitzavim", "Vayelech", "Ha'azinu",
  "V'Zos HaBracha",
];

function extractParsha(shiur: Shiur): { section?: string; detail?: string } {
  // Try to match "Parshas X" or "Parshat X" first
  const parshasMatch = shiur.title.match(/^Parshas?\s+(.+?)(?:\s+\d{4}|\s+578[2-6]|\s*$)/i);
  if (parshasMatch) {
    const name = parshasMatch[1].trim();
    return { section: name };
  }
  // Try to match a raw parsha name
  for (const parsha of PARSHA_NAMES) {
    if (shiur.title.toLowerCase().startsWith(parsha.toLowerCase())) {
      return { section: parsha };
    }
  }

  // Fallback for custom uploads explicitly set to 'parsha' but lack matching term
  if (shiur.categoryId === "parsha") {
    // If it's explicitly uploaded to parsha but has no obvious title, group as "Other Parshas"
    return { section: "Other Parshas" };
  }

  return {};
}

const YOM_TOV_MAP: [RegExp, string][] = [
  [/^Purim/i, "Purim"],
  [/^Chanuk/i, "Chanuka"],
  [/^Rosh\s+Ha[Ss]hana/i, "Rosh Hashana"],
  [/^Yom\s+Kippur/i, "Yom Kippur"],
  [/^Sukk?os/i, "Sukkos"],
  [/^Shavuos/i, "Shavuos"],
  [/^Pesach/i, "Pesach"],
  [/^Lag\s+B/i, "Lag B'Omer"],
  [/^Yud\s+Tes/i, "Yud Tes Kislev"],
  [/^Tu\s+B/i, "Tu B'Shvat"],
];

function extractYomTov(shiur: Shiur): { section?: string; detail?: string } {
  // 1. Try matching the exact Yom Tov pattern in the title
  for (const [pattern, name] of YOM_TOV_MAP) {
    if (pattern.test(shiur.title)) {
      return { section: name };
    }
  }

  // 2. If title didn't match, check if the categoryId or description implies a specific Yom Tov
  // (e.g. if they explicitly created a "purim" series/category, or mentioned Purim in the description)
  const catLower = shiur.categoryId?.toLowerCase() || "";
  const descLower = shiur.description?.toLowerCase() || "";
  for (const [, name] of YOM_TOV_MAP) {
    const nameLower = name.toLowerCase();
    if (catLower.includes(nameLower) || descLower.includes(nameLower)) {
      return { section: name };
    }
  }

  // 3. Fallback for custom manual uploads under the general 'holidays' category
  if (shiur.categoryId === "holidays") {
    return { section: "Other Yamim Tovim" };
  }

  return {};
}

export const SERIES_GROUPS = {
  "nefesh-hachaim": {
    label: "Nefesh HaChaim",
    description: "Rav Chaim Volozhiner's masterwork on the soul and Torah study",
  },
  "tanya": {
    label: "Tanya",
    description: "The Alter Rebbe's foundational work of Chassidic thought — clear and concise 5-minute lessons",
  },
  "bitachon": {
    label: "Bitachon",
    description: "Strengthening trust in Hashem through Torah sources and the weekly Parsha",
  },
} as const;

export const SERIES: SeriesDef[] = [
  // ========== NEFESH HACHAIM (Shaar 1-4) ==========
  {
    slug: "nefesh-hachaim-shaar-1",
    name: "Shaar 1",
    description:
      "The nature of man as the foundation of all worlds — how human actions impact the upper realms.",
    patterns: [/^Nefesh\s+Ha?[Cc]h?a[yi]+m\s+(Shaar\s+1|Introduction)/i],
    group: "nefesh-hachaim",
    navType: "perek",
    extractNav: (s) =>
      extractPerek(s, /^Nefesh\s+Ha?[Cc]h?a[yi]+m\s+Shaar\s+1[,:]?\s*/i),
    sortDefault: "oldest",
    displayOrder: 1,
  },
  {
    slug: "nefesh-hachaim-shaar-2",
    name: "Shaar 2",
    description:
      "The power of tefilla — how prayer ascends and transforms the spiritual worlds.",
    patterns: [/^Nefesh\s+Ha?[Cc]h?a[yi]+m\s+Shaar\s+2/i],
    group: "nefesh-hachaim",
    navType: "perek",
    extractNav: (s) =>
      extractPerek(s, /^Nefesh\s+Ha?[Cc]h?a[yi]+m\s+Shaar\s+2[,:]?\s*/i),
    sortDefault: "oldest",
    displayOrder: 2,
  },
  {
    slug: "nefesh-hachaim-shaar-3",
    name: "Shaar 3",
    description:
      "The holiness of Hashem's presence — kedusha, tumah, and the spiritual realms.",
    patterns: [/^Nefesh\s+Ha?[Cc]h?a[yi]+m\s+Shaar\s+3/i],
    group: "nefesh-hachaim",
    navType: "perek",
    extractNav: (s) =>
      extractPerek(s, /^Nefesh\s+Ha?[Cc]h?a[yi]+m\s+Shaar\s+3[,:]?\s*/i),
    sortDefault: "oldest",
    displayOrder: 3,
  },
  {
    slug: "nefesh-hachaim-shaar-4",
    name: "Shaar 4",
    description:
      "The supreme value of Torah study — understanding Torah Lishmah and the power of learning.",
    patterns: [/^Nefesh\s+Ha?[Cc]h?a[yi]+m\s+Shaar\s+4/i],
    group: "nefesh-hachaim",
    navType: "perek",
    extractNav: (s) =>
      extractPerek(s, /^Nefesh\s+Ha?[Cc]h?a[yi]+m\s+Shaar\s+4[,:]?\s*/i),
    sortDefault: "oldest",
    displayOrder: 4,
  },
  // ========== TANYA (sub-series) ==========
  // Igeres HaTeshuva MUST come before general Tanya Perek pattern
  {
    slug: "tanya-igeres-hateshuvah",
    name: "Igeres HaTeshuva",
    description:
      "The Alter Rebbe's guide to teshuvah — 12 chapters on repentance and returning to Hashem.",
    patterns: [/Igeres\s+HaTeshuva/i],
    group: "tanya",
    navType: "sequential",
    sortDefault: "oldest",
    displayOrder: 2,
  },
  // Takeaway & Summary MUST come before general Tanya Perek pattern
  {
    slug: "tanya-takeaway",
    name: "Takeaway & Summaries",
    description:
      "Key takeaways and chapter summaries for review and chazara.",
    patterns: [/Tanya\s+(Takeaway|Summary|Opening|Introduction)/i],
    group: "tanya",
    navType: "sequential",
    sortDefault: "oldest",
    displayOrder: 3,
  },
  // Main Tanya (Likkutei Amarim) - catches "Tanya Perek X"
  {
    slug: "tanya-likkutei-amarim",
    name: "Likkutei Amarim",
    description:
      "The main body of Tanya — 53 chapters guiding the Beinoni in serving Hashem with mind and heart.",
    patterns: [/^Tanya?\s+P[ei]r[ei]k/i, /^Tanay\s+P[ei]r[ei]k/i],
    group: "tanya",
    navType: "perek",
    extractNav: extractTanyaPerek,
    sortDefault: "oldest",
    displayOrder: 1,
  },
  // Catch-all for any other Tanya episodes
  {
    slug: "tanya-other",
    name: "Other Tanya",
    description: "Additional Tanya shiurim.",
    patterns: [/tanya/i, /tanay/i],
    group: "tanya",
    navType: "sequential",
    sortDefault: "newest",
    displayOrder: 4,
  },

  // ========== BITACHON (sub-series) ==========
  // Pesukai Bitachon MUST come before general Bitachon pattern
  {
    slug: "pesukai-bitachon",
    name: "Pesukai Bitachon",
    description:
      "Exploring key pesukim on the theme of bitachon and trust in Hashem.",
    patterns: [/^Pesukai\s+Bitachon/i],
    group: "bitachon",
    navType: "sequential",
    sortDefault: "oldest",
    displayOrder: 2,
  },
  {
    slug: "bitachon-shiurim",
    name: "Weekly Bitachon",
    description:
      "7-minute chizuk on Bitachon — strengthening trust in Hashem drawn from the Parsha and Moadim.",
    patterns: [/^Bitachon\b/i, /^7\s*min.*chizuk/i],
    group: "bitachon",
    navType: "sequential",
    sortDefault: "newest",
    displayOrder: 1,
  },

  // ========== STANDALONE SERIES (no group) ==========
  {
    slug: "parsha",
    name: "Parshas HaShavua",
    description:
      "Weekly insights on the Torah portion from Rabbi Odom Silverstein.",
    patterns: [
      /^Parshas?\s/i,
      /5783$/,
      /5782$/,
      /5784$/,
      /5785$/,
      /5786$/,
      /\(Chazon\)/i,
      /^(?:Bereishis|Noach|Lech\s*Lecha|Vayeira|Chayei\s*Sarah|Toldos|Vayeitzei|Vayishlach|Vayeshev|Mikeitz|Vayigash|Vayechi|Shemos|Va'?eira|Bo|Beshalach|Yisro|Mishpatim|Terumah|Tetzaveh|Ki\s*Sisa|Vayakhel|Pekudei|Vayikra|Tzav|Shemini|Tazria|Metzora|Acharei\s*Mos|Kedoshim|Emor|Behar|Bechukosai|Bamidbar|Naso|Beha'?aloscha|Shelach|Korach|Chukas|Balak|Pinchas|Matos|Masei|Devorim|Va'?eschanan|Eikev|Re'?eh|Shoftim|Ki\s*Seitzei|Ki\s*Savo|Nitzavim|Vayelech|Ha'?azinu|V'?Zos\s*Ha[Bb]racha)\b/i,
    ],
    group: null,
    navType: "topic",
    extractNav: extractParsha,
    sortDefault: "newest",
  },
  {
    slug: "holidays",
    name: "Yamim Tovim",
    description:
      "Shiurim for the Jewish holidays — Purim, Chanuka, Yomim Noraim, and more.",
    patterns: [
      /^Purim/i,
      /^Chanuk/i,
      /^Rosh\s+Ha[Ss]hana/i,
      /^Yom\s+Kippur/i,
      /^Sukk?os/i,
      /^Shavuos/i,
      /^Pesach/i,
      /^Lag\s+B/i,
      /^Yud\s+Tes/i,
      /^Tu\s+B/i,
    ],
    group: null,
    navType: "topic",
    extractNav: extractYomTov,
    sortDefault: "newest",
  },

  // Catch-all — MUST be last
  {
    slug: "other",
    name: "All Shiurim",
    description: "Browse all shiurim uploaded to the site, including uncategorized talks.",
    patterns: [/.+/],
    group: null,
    navType: "topic",
    sortDefault: "newest",
  },
];

export function getSeriesBySlug(slug: string): SeriesDef | undefined {
  return SERIES.find((s) => s.slug === slug);
}

export function getAllSlugs(): string[] {
  return [
    ...SERIES.map((s) => s.slug),
    ...Object.keys(SERIES_GROUPS), // group-level pages
  ];
}

export function getGroupInfo(groupId: string): { label: string; description: string } | undefined {
  return (SERIES_GROUPS as Record<string, { label: string; description: string }>)[groupId];
}

export function getGroupSeriesPatterns(groupId: string): RegExp[] {
  return SERIES.filter((s) => s.group === groupId).flatMap((s) => s.patterns);
}

export function matchTitleToSeries(title: string): SeriesDef | undefined {
  for (const series of SERIES) {
    for (const pattern of series.patterns) {
      if (pattern.test(title)) {
        return series;
      }
    }
  }
  return undefined;
}

