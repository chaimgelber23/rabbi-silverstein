export interface Shiur {
  id: string;
  title: string;
  audioUrl: string;
  duration: string;
  durationSeconds: number;
  pubDate: string;
  description: string;
  link: string;
  categoryId: string;
  subLevel1?: string;
  subLevel2?: string;
}

export interface PlayerState {
  currentShiur: Shiur | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
}

export type SortOrder = "newest" | "oldest";
export type NavType = "sequential" | "perek" | "topic" | "parsha";
export type SeriesGroup = string | null;

export interface SeriesDef {
  slug: string;
  name: string;
  description: string;
  patterns: RegExp[];
  group: SeriesGroup;
  navType: NavType;
  extractNav?: (title: string) => { section?: string; detail?: string };
  sortDefault?: SortOrder;
  displayOrder?: number;
}

export interface SeriesStats {
  slug: string;
  name: string;
  description: string;
  group: SeriesGroup;
  episodeCount: number;
  latestDate: string;
  displayOrder?: number;
}
