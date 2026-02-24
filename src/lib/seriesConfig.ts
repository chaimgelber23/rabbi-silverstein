import type { SeriesDef } from "./types";

function extractPerek(title: string, prefix: RegExp): { section?: string; detail?: string } {
  const cleaned = title.replace(prefix, "").trim();
  const perekMatch = cleaned.match(/^(?:perek\s*)?(\d+)/i);
  return perekMatch ? { section: `Perek ${perekMatch[1]}` } : {};
}

export const SERIES_GROUPS = {
  "nefesh-hachaim": {
    label: "Nefesh HaChaim",
    description: "Rav Chaim Volozhiner's masterwork on the soul and Torah study",
  },
} as const;

export const SERIES: SeriesDef[] = [
  // ========== NEFESH HACHAIM (grouped, in Shaar order) ==========
  {
    slug: "nefesh-hachaim-shaar-1",
    name: "Shaar 1",
    description:
      "The nature of man as the foundation of all worlds — how human actions impact the upper realms.",
    patterns: [/^Nefesh\s+Ha?[Cc]h?a[yi]+m\s+Shaar\s+1/i],
    group: "nefesh-hachaim",
    navType: "perek",
    extractNav: (t) =>
      extractPerek(t, /^Nefesh\s+Ha?[Cc]h?a[yi]+m\s+Shaar\s+1[,:]?\s*/i),
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
    extractNav: (t) =>
      extractPerek(t, /^Nefesh\s+Ha?[Cc]h?a[yi]+m\s+Shaar\s+2[,:]?\s*/i),
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
    extractNav: (t) =>
      extractPerek(t, /^Nefesh\s+Ha?[Cc]h?a[yi]+m\s+Shaar\s+3[,:]?\s*/i),
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
    extractNav: (t) =>
      extractPerek(t, /^Nefesh\s+Ha?[Cc]h?a[yi]+m\s+Shaar\s+4[,:]?\s*/i),
    sortDefault: "oldest",
    displayOrder: 4,
  },

  // ========== UNGROUPED SERIES ==========
  {
    slug: "tanya",
    name: "5 Minute Tanya",
    description:
      "Daily insights into the Tanya — the foundational work of Chassidic thought by the Alter Rebbe.",
    patterns: [/tanya/i],
    group: null,
    navType: "sequential",
    sortDefault: "oldest",
  },
  {
    slug: "bitachon",
    name: "Bitachon",
    description:
      "7-minute chizuk on Bitachon — strengthening trust in Hashem drawn from the Parsha and Moadim.",
    patterns: [/bitachon/i, /^7\s*min.*chizuk/i],
    group: null,
    navType: "sequential",
    sortDefault: "newest",
  },
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
    navType: "sequential",
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
    ],
    group: null,
    navType: "sequential",
    sortDefault: "newest",
  },

  // Catch-all — MUST be last
  {
    slug: "other",
    name: "Other Shiurim",
    description: "Additional shiurim on various Torah topics.",
    patterns: [/.+/],
    group: null,
    navType: "sequential",
  },
];

export function getSeriesBySlug(slug: string): SeriesDef | undefined {
  return SERIES.find((s) => s.slug === slug);
}

export function getAllSlugs(): string[] {
  return SERIES.map((s) => s.slug);
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
