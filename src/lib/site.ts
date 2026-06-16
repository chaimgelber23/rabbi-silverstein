// Single source of truth for the canonical site origin.
// Must match the live primary domain Vercel serves a 200 on. The bare apex
// (rabbiodomsilverstein.com) is now the primary and serves directly; www
// 308-redirects to it. So canonical URLs, the sitemap, robots, and JSON-LD
// all use the bare apex.
export const SITE_URL = "https://rabbiodomsilverstein.com";
export const SITE_NAME = "Rabbi Odom Silverstein | Torah Shiurim";
